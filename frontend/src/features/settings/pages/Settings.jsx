import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, ArrowRight } from "lucide-react";
import { C } from "../../../shared/styles/colors";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  //   const sections = [
  //     { t: "Learning Preferences", d: "Subjects, difficulty, daily goal" },
  //     { t: "Notifications", d: "Reminders & streak alerts" },
  //     { t: "Appearance", d: "Dark mode, theme" },
  //     { t: "Audio", d: "Recording quality settings" },
  //     { t: "Data", d: "Export notes, download flashcards" },
  //   ];

  return (
    <div style={{ padding: 28, maxWidth: 580, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
        Settings
      </h2>

      <div
        style={{
          padding: 18,
          borderRadius: 12,
          background: C.card,
          border: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: C.primaryDim,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User size={22} color={C.primary} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 600 }}>{user?.name}</p>
          <p style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
            {user?.email}
          </p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        style={{
          width: "100%",
          padding: "12px 0",
          borderRadius: 10,
          border: `1px solid ${C.redBorder}`,
          background: C.redDim,
          color: C.red,
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
          marginTop: 12,
        }}
      >
        Log Out
      </button>
    </div>
  );
}
