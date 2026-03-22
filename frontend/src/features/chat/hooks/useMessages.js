import { useState, useCallback } from "react";
import api from "../../../api/client";

export function useMessages(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/chat/conversations/${conversationId}/messages`,
      );
      setMessages(res.data.data.messages);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  return { messages, setMessages, loading, fetch };
}
