import { MessageSquare, Plus } from "lucide-react";
import { C } from "../../../shared/styles/colors";

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  onCreate,
  createDisabled,
}) {
  return (
    <div
      style={{
        width: 260,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          padding: "16px 16px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>Conversations</h3>
        <button
          onClick={onCreate}
          disabled={createDisabled}
          title={createDisabled ? "Conversation limit reached" : "New conversation"}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: createDisabled ? C.card : C.primaryDim,
            border: `1px solid ${createDisabled ? C.border : C.primaryBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: createDisabled ? "not-allowed" : "pointer",
            opacity: createDisabled ? 0.5 : 1,
          }}
        >
          <Plus size={14} color={createDisabled ? C.textDim : C.primary} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px" }}>
        {conversations.length === 0 && (
          <p
            style={{
              padding: "20px 8px",
              fontSize: 12,
              color: C.textDim,
              textAlign: "center",
            }}
          >
            No conversations yet. Start one!
          </p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              marginBottom: 2,
              cursor: "pointer",
              background: activeId === c.id ? C.primaryDim : "transparent",
              border: `1px solid ${activeId === c.id ? C.primaryBorder : "transparent"}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare
                size={14}
                color={activeId === c.id ? C.primary : C.textDim}
              />
              <p
                style={{
                  fontSize: 13,
                  fontWeight: activeId === c.id ? 600 : 400,
                  color: activeId === c.id ? C.text : C.textSec,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {c.title || "New conversation"}
              </p>
            </div>
            {c.lastMessagePreview && (
              <p
                style={{
                  fontSize: 11,
                  color: C.textDim,
                  marginTop: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  paddingLeft: 22,
                }}
              >
                {c.lastMessagePreview}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
