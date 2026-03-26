import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Brain } from "lucide-react";
import { C } from "../../../shared/styles/colors";
import CookieBanner from "../../../shared/components/CookieBanner";

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  background: C.input,
  border: `1px solid ${C.border}`,
  color: C.text,
  fontSize: 14,
  outline: "none",
};

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === "CSRF_MISSING" || code === "CSRF_INVALID") {
        setShowCookieBanner(true);
      } else {
        setError(err.response?.data?.error?.message || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Fragment>
      {showCookieBanner && (
        <CookieBanner onClose={() => setShowCookieBanner(false)} />
      )}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 400,
          padding: 24,
          margin: "0 16px",
          background: C.surface,
          borderRadius: 16,
          border: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
          }}
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
            <Brain size={14} color="#fff" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700 }}>VoiceLearn</span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          Create your account
        </h2>
        <p style={{ color: C.textDim, fontSize: 13, marginBottom: 24 }}>
          Start your learning journey
        </p>
        {error && (
          <div
            style={{
              padding: 10,
              borderRadius: 8,
              background: C.redDim,
              border: `1px solid ${C.redBorder}`,
              color: C.red,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              style={{
                fontSize: 12,
                color: C.textDim,
                display: "block",
                marginBottom: 5,
              }}
            >
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                color: C.textDim,
                display: "block",
                marginBottom: 5,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                color: C.textDim,
                display: "block",
                marginBottom: 5,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              style={inputStyle}
              required
              minLength={8}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 10,
            border: "none",
            background: C.primary,
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            marginTop: 20,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: C.textDim,
            marginTop: 16,
          }}
        >
          Already have an account?{" "}
          <span
            style={{ color: C.primary, cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Log in
          </span>
        </p>
      </form>
    </div>
    </Fragment>
  );
}
