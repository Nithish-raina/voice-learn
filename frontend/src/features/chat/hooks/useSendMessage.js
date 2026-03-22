import { useState, useCallback } from "react";
import api from "../../../api/client";

export function useSendMessage() {
  const [sending, setSending] = useState(false);

  const send = useCallback(async (conversationId, content) => {
    setSending(true);
    try {
      const res = await api.post(
        `/chat/conversations/${conversationId}/messages`,
        { content },
      );
      return res.data.data;
    } catch (err) {
      throw err;
    } finally {
      setSending(false);
    }
  }, []);

  return { send, sending };
}
