import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  BookOpen,
  MessageSquare,
  Layers,
  BarChart3,
  Settings,
  Mic,
  Brain,
  User,
} from "lucide-react";
import { C } from "../styles/colors";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/library", icon: BookOpen, label: "Library" },
  { to: "/chat", icon: MessageSquare, label: "Chat" },
  { to: "/flashcards", icon: Layers, label: "Flashcards" },
  { to: "/insights", icon: BarChart3, label: "Insights" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const linkStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    borderRadius: 8,
    background: isActive ? C.primaryDim : "transparent",
    textDecoration: "none",
  });

  return (
    <div
      style={{
        width: 220,
        minHeight: "100vh",
        background: C.surface,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "20px 12px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "0 8px",
          marginBottom: 28,
          cursor: "pointer",
        }}
        onClick={() => navigate("/dashboard")}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Brain size={15} color="#fff" />
        </div>
        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: C.text,
            letterSpacing: -0.3,
          }}
        >
          VoiceLearn
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => linkStyle(isActive)}
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} color={isActive ? C.primary : C.textDim} />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? C.text : C.textSec,
                  }}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <button
        onClick={() => navigate("/record")}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          margin: "20px 8px 0",
          padding: "10px 0",
          borderRadius: 10,
          background: C.primary,
          border: "none",
          cursor: "pointer",
        }}
      >
        <Mic size={16} color="#fff" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
          New Recording
        </span>
      </button>

      <div style={{ flex: 1 }} />

      <NavLink to="/settings" style={({ isActive }) => linkStyle(isActive)}>
        {({ isActive }) => (
          <>
            <Settings size={18} color={isActive ? C.primary : C.textDim} />
            <span
              style={{ fontSize: 13, color: isActive ? C.text : C.textSec }}
            >
              Settings
            </span>
          </>
        )}
      </NavLink>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "12px 8px 0",
          borderTop: `1px solid ${C.border}`,
          marginTop: 8,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: C.primaryDim,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User size={15} color={C.primary} />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
            {user?.name}
          </p>
          <p style={{ fontSize: 10, color: C.textDim }}>{user?.email}</p>
        </div>
      </div>
    </div>
  );
}
