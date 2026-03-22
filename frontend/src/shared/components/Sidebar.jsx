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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { C } from "../styles/colors";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/library", icon: BookOpen, label: "Library" },
  { to: "/chat", icon: MessageSquare, label: "Chat" },
  { to: "/flashcards", icon: Layers, label: "Flashcards" },
  { to: "/insights", icon: BarChart3, label: "Insights" },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const width = collapsed ? 56 : 220;

  const linkStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: collapsed ? 0 : 10,
    justifyContent: collapsed ? "center" : "flex-start",
    padding: collapsed ? "9px 0" : "9px 12px",
    borderRadius: 8,
    background: isActive ? C.primaryDim : "transparent",
    textDecoration: "none",
  });

  return (
    <div
      style={{
        width,
        minHeight: "100vh",
        background: C.surface,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        padding: collapsed ? "20px 8px" : "20px 12px",
        flexShrink: 0,
        transition: "width 0.2s ease",
        overflow: "hidden",
      }}
    >
      {/* Logo + toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? 0 : "0 8px",
          marginBottom: collapsed ? 20 : 28,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
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
              flexShrink: 0,
            }}
          >
            <Brain size={15} color="#fff" />
          </div>
          {!collapsed && (
            <span
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: C.text,
                letterSpacing: -0.3,
                whiteSpace: "nowrap",
              }}
            >
              VoiceLearn
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggle}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
              borderRadius: 6,
            }}
            title="Collapse sidebar"
          >
            <PanelLeftClose size={16} color={C.textDim} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggle}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
            borderRadius: 6,
          }}
          title="Expand sidebar"
        >
          <PanelLeftOpen size={18} color={C.textDim} />
        </button>
      )}

      {/* Nav items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => linkStyle(isActive)}
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  color={isActive ? C.primary : C.textDim}
                  style={{ flexShrink: 0 }}
                />
                {!collapsed && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? C.text : C.textSec,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* New Recording button */}
      <button
        onClick={() => navigate("/record")}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: collapsed ? 0 : 8,
          margin: collapsed ? "20px 0 0" : "20px 8px 0",
          padding: "10px 0",
          borderRadius: 10,
          background: C.primary,
          border: "none",
          cursor: "pointer",
        }}
        title={collapsed ? "New Recording" : undefined}
      >
        <Mic size={16} color="#fff" />
        {!collapsed && (
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>
            New Recording
          </span>
        )}
      </button>

      <div style={{ flex: 1 }} />

      {/* Settings */}
      <NavLink
        to="/settings"
        style={({ isActive }) => linkStyle(isActive)}
        title={collapsed ? "Settings" : undefined}
      >
        {({ isActive }) => (
          <>
            <Settings
              size={18}
              color={isActive ? C.primary : C.textDim}
              style={{ flexShrink: 0 }}
            />
            {!collapsed && (
              <span
                style={{ fontSize: 13, color: isActive ? C.text : C.textSec, whiteSpace: "nowrap" }}
              >
                Settings
              </span>
            )}
          </>
        )}
      </NavLink>

      {/* User profile */}
      {!collapsed && (
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
              flexShrink: 0,
            }}
          >
            <User size={15} color={C.primary} />
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name}
            </p>
            <p style={{ fontSize: 10, color: C.textDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email}
            </p>
          </div>
        </div>
      )}
      {collapsed && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            borderTop: `1px solid ${C.border}`,
            paddingTop: 12,
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
            title={user?.name}
          >
            <User size={15} color={C.primary} />
          </div>
        </div>
      )}
    </div>
  );
}
