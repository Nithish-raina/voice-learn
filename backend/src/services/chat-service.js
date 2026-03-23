import { chatRepository } from "../repositories/chat-repository.js";
import { ragService } from "./rag-service.js";
import { callLLM } from "../lib/llm-client.js";
import { AppError } from "../utils/errors.js";

export const chatService = {
  async createConversation(userId) {
    return chatRepository.createConversation(userId);
  },

  async listConversations(userId, { page = 1, limit = 10 }) {
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const { conversations, totalItems } =
      await chatRepository.findConversations(userId, { page, limit });

    const formatted = conversations.map((c) => ({
      id: c.id,
      title: c.title,
      lastMessagePreview: c.messages[0]?.content?.substring(0, 100) || null,
      createdAt: c.createdAt,
    }));

    return {
      conversations: formatted,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  },

  async getMessages(userId, conversationId, { page = 1, limit = 50 }) {
    const conversation =
      await chatRepository.findConversationById(conversationId);
    if (!conversation)
      throw new AppError(
        "Conversation not found",
        404,
        "CONVERSATION_NOT_FOUND",
      );
    if (conversation.userId !== userId)
      throw new AppError("Forbidden", 403, "FORBIDDEN");

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 50;

    const { messages, totalItems } = await chatRepository.findMessages(
      conversationId,
      { page, limit },
    );

    const formatted = messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      sources: m.sources,
      createdAt: m.createdAt,
    }));

    return {
      messages: formatted,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  },

  async sendMessage(userId, conversationId, content) {
    if (!content || !content.trim())
      throw new AppError("Message cannot be empty", 400, "EMPTY_MESSAGE");

    const conversation =
      await chatRepository.findConversationById(conversationId);
    if (!conversation)
      throw new AppError(
        "Conversation not found",
        404,
        "CONVERSATION_NOT_FOUND",
      );
    if (conversation.userId !== userId)
      throw new AppError("Forbidden", 403, "FORBIDDEN");

    // Save user message
    const userMessage = await chatRepository.createMessage({
      conversationId,
      role: "user",
      content: content.trim(),
    });

    // Search knowledge base via RAG
    let chunks = [];
    try {
      chunks = await ragService.query(userId, content);
    } catch (error) {
      console.error("RAG query failed:", error.message);
      // Continue without RAG context — LLM will respond with general knowledge
    }

    // Build context from chunks
    const contextParts = chunks.map((c, i) => {
      return `[Source ${i + 1}: ${c.topic} — ${c.type}]\n${c.text}`;
    });
    const context =
      contextParts.length > 0
        ? `Here is relevant information from the user's past recordings:\n\n${contextParts.join("\n\n")}`
        : "No relevant recordings found in the user's history.";

    // Extract unique sources for citations
    const sourceMap = {};
    chunks.forEach((c) => {
      if (c.sessionId && !sourceMap[c.sessionId]) {
        sourceMap[c.sessionId] = { sessionId: c.sessionId, topic: c.topic };
      }
    });
    const sources = Object.values(sourceMap);

    // Call LLM
    const system = `You are a learning assistant for VoiceLearn. The user records voice explanations of topics and gets AI feedback. You have access to their past recordings, scores, strengths, gaps, and flashcards.

When answering:
- Base your answers on the user's actual recordings and learning data provided in the context
- If the context contains relevant information, use it and reference which recording it came from
- If no relevant recordings exist, say so and offer general guidance
- Be encouraging but honest about gaps
- Keep answers concise and actionable`;

    const prompt = `${context}\n\nUser's question: ${content}`;

    let response;
    try {
      response = await callLLM({ system, prompt, maxTokens: 1000 });
      if (typeof response !== "string") response = JSON.stringify(response);
    } catch (error) {
      console.error("LLM call failed:", error.message);
      response =
        "Sorry, I had trouble processing your question. Please try again.";
    }

    // Save assistant message
    const assistantMessage = await chatRepository.createMessage({
      conversationId,
      role: "assistant",
      content: response,
      sources: sources.length > 0 ? sources : null,
    });

    // Auto-generate title from first message
    const messageCount = await chatRepository.getMessageCount(conversationId);
    if (messageCount <= 2 && !conversation.title) {
      try {
        const titleResponse = await callLLM({
          system:
            "Your ONLY job is to output a short title (3-5 words) for a chat conversation. Do NOT answer the question. Do NOT explain anything. Output ONLY the title words.",
          prompt: `Create a 3-5 word title for this chat message:\n"${content}"\n\nTitle:`,
          maxTokens: 15,
        });
        let title =
          typeof titleResponse === "string"
            ? titleResponse.replace(/^["'\s]+|["'\s]+$/g, "").trim()
            : null;
        // Truncate to max 50 chars and ensure it's reasonable
        if (title && title.length > 50) title = title.substring(0, 50).trim();
        if (!title || title.length < 2) title = content.substring(0, 40);
        await chatRepository.updateConversationTitle(conversationId, title);
      } catch (error) {
        console.error("[Chat] Title generation failed:", error.message);
        try {
          await chatRepository.updateConversationTitle(
            conversationId,
            content.substring(0, 40),
          );
        } catch (updateError) {
          console.error("[Chat] Failed to set fallback title:", updateError.message);
        }
      }
    }

    return {
      userMessage: {
        id: userMessage.id,
        role: "user",
        content: userMessage.content,
        sources: null,
        createdAt: userMessage.createdAt,
      },
      assistantMessage: {
        id: assistantMessage.id,
        role: "assistant",
        content: assistantMessage.content,
        sources: assistantMessage.sources,
        createdAt: assistantMessage.createdAt,
      },
    };
  },
};
