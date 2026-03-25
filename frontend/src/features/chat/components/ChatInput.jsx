import { useState } from "react";
import { Send } from "lucide-react";
import { C } from "../../../shared/styles/colors";

export default function ChatInput({ onSend, sending, disabled }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || sending || disabled) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: "16px 0",
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        gap: 10,
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={disabled ? "Message limit reached for this conversation" : "Ask about your learnings..."}
        disabled={sending || disabled}
        style={{
          flex: 1,
          padding: "11px 14px",
          borderRadius: 10,
          background: C.input,
          border: `1px solid ${C.border}`,
          color: C.text,
          fontSize: 14,
          outline: "none",
        }}
      />
      <button
        type="submit"
        disabled={sending || disabled || !text.trim()}
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: sending || disabled ? C.card : C.primary,
          border: "none",
          cursor: sending || disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Send size={16} color="#fff" />
      </button>
    </form>
  );
}
