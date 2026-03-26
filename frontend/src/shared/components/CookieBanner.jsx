import { useState, useEffect } from "react";
import { C } from "../styles/colors";

function areCookiesEnabled() {
  try {
    document.cookie = "vl_cookie_test=1; SameSite=Lax; path=/";
    const enabled = document.cookie.includes("vl_cookie_test=1");
    document.cookie =
      "vl_cookie_test=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    return enabled;
  } catch {
    return false;
  }
}

export default function CookieBanner() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!areCookiesEnabled()) setBlocked(true);
  }, []);

  if (!blocked) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        padding: 16,
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 24,
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Cookies are required
        </h3>
        <p
          style={{
            fontSize: 14,
            color: C.textSec,
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          VoiceLearn needs cookies to keep you signed in securely. It looks like
          your browser is set to block cookies by default. You don't need to
          change that globally — just add this site as an exception.
        </p>

        <div
          style={{
            background: C.card,
            borderRadius: 10,
            padding: 16,
            marginBottom: 20,
            fontSize: 13,
            color: C.textSec,
            lineHeight: 1.7,
          }}
        >
          <p style={{ fontWeight: 600, color: C.text, marginBottom: 8 }}>
            Allow cookies for this site only:
          </p>
          <p>
            <strong style={{ color: C.text }}>Chrome:</strong> Settings &gt;
            Privacy &amp; Security &gt; Third-party cookies &gt; under "Allowed
            to use cookies", click Add and enter this site's address
          </p>
          <p>
            <strong style={{ color: C.text }}>Firefox:</strong> Settings &gt;
            Privacy &amp; Security &gt; under "Cookies and Site Data", click
            Manage Exceptions &gt; enter this site's address &gt; click Allow
          </p>
          <p>
            <strong style={{ color: C.text }}>Safari:</strong> Safari &gt;
            Settings &gt; Privacy &gt; uncheck "Block all cookies" (Safari does
            not support per-site cookie exceptions)
          </p>
          <p>
            <strong style={{ color: C.text }}>Edge:</strong> Settings &gt;
            Cookies and site permissions &gt; Manage and delete cookies and site
            data &gt; under "Allow", click Add and enter this site's address
          </p>
          <p style={{ color: C.textDim, marginTop: 8, fontSize: 12 }}>
            This only allows cookies for VoiceLearn — your other browsing stays
            private.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
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
          }}
        >
          I've enabled cookies — reload
        </button>
      </div>
    </div>
  );
}
