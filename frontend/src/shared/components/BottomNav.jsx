import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  Layers,
  BarChart3,
  Mic,
} from "lucide-react";
import { C } from "../styles/colors";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/library", icon: BookOpen, label: "Library" },
  { to: "/record", icon: Mic, label: "Record", isCta: true },
  { to: "/flashcards", icon: Layers, label: "Cards" },
  { to: "/insights", icon: BarChart3, label: "Insights" },
];

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "6px 0 env(safe-area-inset-bottom, 6px)",
        zIndex: 100,
      }}
    >
      {navItems.map((item) =>
        item.isCta ? (
          <button
            key={item.to}
            onClick={() => navigate(item.to)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: C.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: -18,
                boxShadow: `0 2px 12px rgba(99,102,241,0.4)`,
              }}
            >
              <item.icon size={20} color="#fff" />
            </div>
            <span style={{ fontSize: 10, color: C.primary, fontWeight: 600 }}>
              {item.label}
            </span>
          </button>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              textDecoration: "none",
              padding: "4px 0",
              minWidth: 48,
            }}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={20}
                  color={isActive ? C.primary : C.textDim}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: isActive ? C.primary : C.textDim,
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ),
      )}
    </nav>
  );
}
