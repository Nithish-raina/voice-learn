import { useState, useEffect, useRef } from "react";
import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import { useSendMessage } from "../hooks/useSendMessage";
import { useCreateConversation } from "../hooks/useCreateConversation";
import ConversationList from "../components/ConversationList";
import MessageBubble from "../components/MessageBubble";
import ChatInput from "../components/ChatInput";
import SuggestedPrompts from "../components/SuggestedPrompts";
import EmptyChat from "../components/EmptyChat";
import ChatSkeleton, { MessagesSkeleton } from "../components/ChatSkeleton";
import Skeleton from "../../../shared/components/Skeleton";
import { useIsMobile } from "../../../shared/hooks/useIsMobile";
import { Menu, X } from "lucide-react";
import { C } from "../../../shared/styles/colors";

export default function Chat() {
  const {
    data: convData,
    loading: convsLoading,
    refetch: refetchConvs,
  } = useConversations();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!convsLoading && initialLoad) setInitialLoad(false);
  }, [convsLoading]);
  const { mutate: createConv } = useCreateConversation();
  const { send, sending } = useSendMessage();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [activeConvId, setActiveConvId] = useState(null);
  const [error, setError] = useState("");
  const [convLimitReached, setConvLimitReached] = useState(false);
  const [msgLimitReached, setMsgLimitReached] = useState(false);
  const {
    messages,
    setMessages,
    loading: msgsLoading,
    fetch: fetchMessages,
  } = useMessages(activeConvId);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeConvId) fetchMessages();
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSelectConversation(id) {
    setActiveConvId(id);
    setMsgLimitReached(false);
    setError("");
    if (isMobile) setDrawerOpen(false);
  }

  async function handleCreateConversation() {
    setError("");
    try {
      const conv = await createConv({});
      setActiveConvId(conv.id);
      setMessages([]);
      setMsgLimitReached(false);
      refetchConvs();
      if (isMobile) setDrawerOpen(false);
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === "CONVERSATION_LIMIT_REACHED") setConvLimitReached(true);
      const msg =
        err.response?.data?.error?.message ||
        "Failed to create conversation";
      setError(msg);
    }
  }

  async function handleSendMessage(content) {
    setError("");
    if (!activeConvId) {
      try {
        const conv = await createConv({});
        setActiveConvId(conv.id);
        setMessages([]);
        setMsgLimitReached(false);
        await refetchConvs();
        setTimeout(() => sendToConversation(conv.id, content), 100);
        return;
      } catch (err) {
        const code = err.response?.data?.error?.code;
        if (code === "CONVERSATION_LIMIT_REACHED") setConvLimitReached(true);
        const msg =
          err.response?.data?.error?.message ||
          "Failed to create conversation";
        setError(msg);
        return;
      }
    }

    sendToConversation(activeConvId, content);
  }

  async function sendToConversation(convId, content) {
    const tempUserMsg = {
      id: "temp-user",
      role: "user",
      content,
      sources: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const result = await send(convId, content);
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== "temp-user");
        return [...withoutTemp, result.userMessage, result.assistantMessage];
      });
      refetchConvs();
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== "temp-user"));
      const code = err.response?.data?.error?.code;
      if (code === "MESSAGE_LIMIT_REACHED") setMsgLimitReached(true);
      const msg =
        err.response?.data?.error?.message || "Failed to send message";
      setError(msg);
    }
  }

  const conversations = convData?.conversations || [];

  if (convsLoading && initialLoad) return <ChatSkeleton />;

  return (
    <div style={{ display: "flex", height: isMobile ? "calc(100vh - 112px)" : "100%", position: "relative" }}>
      {/* Mobile drawer overlay */}
      {isMobile && drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 10,
          }}
        />
      )}

      {/* Conversation list — always visible on desktop, drawer on mobile */}
      {isMobile ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 280,
            background: C.surface,
            borderRight: `1px solid ${C.border}`,
            zIndex: 20,
            transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.25s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "10px 10px 0",
            }}
          >
            <button
              onClick={() => setDrawerOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
            >
              <X size={18} color={C.textDim} />
            </button>
          </div>
          <ConversationList
            conversations={conversations}
            activeId={activeConvId}
            onSelect={handleSelectConversation}
            onCreate={handleCreateConversation}
            createDisabled={convLimitReached}
          />
        </div>
      ) : (
        <ConversationList
          conversations={conversations}
          activeId={activeConvId}
          onSelect={handleSelectConversation}
          onCreate={handleCreateConversation}
        />
      )}

      {/* Main chat area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: isMobile ? "0 14px" : "0 24px",
          minWidth: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 0",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {isMobile && (
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <Menu size={20} color={C.textSec} />
            </button>
          )}
          <div>
            <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700 }}>
              {activeConvId
                ? conversations.find((c) => c.id === activeConvId)?.title ||
                  "New conversation"
                : "Chat With Your Knowledge"}
            </h2>
            <p style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
              Ask questions about your recordings and learnings
            </p>
          </div>
        </div>

        {/* Messages or Empty State */}
        {!activeConvId ? (
          <EmptyChat onCreate={handleCreateConversation} disabled={convLimitReached} />
        ) : msgsLoading ? (
          <Skeleton><MessagesSkeleton /></Skeleton>
        ) : messages.length === 0 ? (
          <SuggestedPrompts onSelect={handleSendMessage} />
        ) : (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              padding: "16px 0",
            }}
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {sending && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "14px 18px",
                    borderRadius: 12,
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderTopLeftRadius: 3,
                  }}
                >
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0, 0.2, 0.4].map((delay) => (
                      <div
                        key={delay}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: C.textDim,
                          animation: `pulse 1s infinite ${delay}s`,
                        }}
                      />
                    ))}
                  </div>
                  <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div
            style={{
              padding: "10px 16px",
              background: "#fef3c7",
              border: `1px solid #f59e0b`,
              borderRadius: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "8px 0 0",
            }}
          >
            <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>
              {error}
            </p>
            <button
              onClick={() => setError("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
                display: "flex",
                flexShrink: 0,
              }}
            >
              <X size={14} color="#92400e" />
            </button>
          </div>
        )}

        {/* Input */}
        {(activeConvId || conversations.length === 0) && (
          <ChatInput onSend={handleSendMessage} sending={sending} disabled={msgLimitReached} />
        )}
      </div>
    </div>
  );
}
