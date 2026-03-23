// service for handling speech-to-text via Deepgram WebSocket
import WebSocket from "ws";

const DEEPGRAM_URL = "wss://api.deepgram.com/v1/listen";
const CONNECTION_TIMEOUT_MS = 10000;

export function createDeepgramStream(options = {}) {
  const {
    onTranscript,
    onError,
    onClose,
    onOpen,
    sampleRate = 16000,
  } = options;

  if (!process.env.DEEPGRAM_API_KEY) {
    const error = new Error("Deepgram API key is not configured");
    console.error("[STT]", error.message);
    if (onError) onError(error);
    // Return a no-op stream so callers don't crash
    return {
      sendAudio() {},
      close() {},
      closeAndWait() { return Promise.resolve(); },
      getTranscript() { return ""; },
      isConnected() { return false; },
    };
  }

  const params = new URLSearchParams({
    model: "nova-2",
    smart_format: "true",
    interim_results: "true",
    punctuate: "true",
    encoding: "linear16",
    sample_rate: String(sampleRate),
    channels: "1",
    endpointing: "500",
  });

  let dgWs;
  try {
    dgWs = new WebSocket(`${DEEPGRAM_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      },
    });
  } catch (error) {
    console.error("[STT] Failed to create Deepgram WebSocket:", error.message);
    if (onError) onError(error);
    return {
      sendAudio() {},
      close() {},
      closeAndWait() { return Promise.resolve(); },
      getTranscript() { return ""; },
      isConnected() { return false; },
    };
  }

  let fullTranscript = "";
  let lastInterim = "";
  let isOpen = false;
  let connectionTimedOut = false;

  // Timeout if Deepgram doesn't connect within threshold
  const connectionTimer = setTimeout(() => {
    if (!isOpen) {
      connectionTimedOut = true;
      console.error("[STT] Deepgram connection timed out");
      const error = new Error("Speech-to-text service connection timed out");
      if (onError) onError(error);
      try {
        dgWs.close();
      } catch (e) {
        console.error("[STT] Error closing timed-out connection:", e.message);
      }
    }
  }, CONNECTION_TIMEOUT_MS);

  dgWs.on("open", () => {
    clearTimeout(connectionTimer);
    isOpen = true;
    console.log("[STT] Deepgram stream opened");
    if (onOpen) onOpen();
  });

  dgWs.on("message", (data) => {
    try {
      const response = JSON.parse(data.toString());

      if (response.type === "Results") {
        const transcript = response.channel?.alternatives?.[0]?.transcript;
        if (transcript && transcript.trim()) {
          const isFinal = response.is_final;

          if (isFinal) {
            fullTranscript += (fullTranscript ? " " : "") + transcript.trim();
            lastInterim = "";
          } else {
            lastInterim = transcript.trim();
          }

          if (onTranscript) {
            onTranscript({
              partial: transcript.trim(),
              full:
                fullTranscript +
                (lastInterim ? (fullTranscript ? " " : "") + lastInterim : ""),
              isFinal,
            });
          }
        }
      } else if (response.type === "Error") {
        console.error("[STT] Deepgram returned error:", response.description || response.message);
        if (onError) onError(new Error(response.description || "Speech-to-text service error"));
      }
    } catch (error) {
      console.error("[STT] Failed to parse Deepgram message:", error.message);
    }
  });

  dgWs.on("error", (error) => {
    clearTimeout(connectionTimer);
    console.error("[STT] Deepgram stream error:", error.message);
    if (onError) onError(error);
  });

  dgWs.on("unexpected-response", (req, res) => {
    clearTimeout(connectionTimer);
    const statusCode = res.statusCode;
    console.error(`[STT] Deepgram unexpected response: HTTP ${statusCode}`);
    let errorMsg = "Speech-to-text service is unavailable";
    if (statusCode === 401 || statusCode === 403) {
      errorMsg = "Speech-to-text service authentication failed";
    }
    if (onError) onError(new Error(errorMsg));
  });

  let closeResolve = null;

  dgWs.on("close", (code, reason) => {
    clearTimeout(connectionTimer);
    isOpen = false;
    const reasonStr = reason ? reason.toString() : "";
    console.log(`[STT] Deepgram stream closed: code=${code} reason=${reasonStr}`);
    if (closeResolve) closeResolve();
    if (onClose) onClose();
  });

  return {
    sendAudio(chunk) {
      if (isOpen && dgWs.readyState === WebSocket.OPEN) {
        try {
          dgWs.send(chunk);
        } catch (error) {
          console.error("[STT] Failed to send audio chunk:", error.message);
        }
      }
    },

    close() {
      if (isOpen && dgWs.readyState === WebSocket.OPEN) {
        try {
          dgWs.send(JSON.stringify({ type: "CloseStream" }));
        } catch (error) {
          console.error("[STT] Failed to send close command:", error.message);
        }
      }
    },

    /** Sends CloseStream and waits for Deepgram to actually close (flush final transcript) */
    closeAndWait(timeoutMs = 5000) {
      return new Promise((resolve) => {
        if (!isOpen || dgWs.readyState !== WebSocket.OPEN) {
          resolve();
          return;
        }
        closeResolve = resolve;
        try {
          dgWs.send(JSON.stringify({ type: "CloseStream" }));
        } catch (error) {
          console.error("[STT] Failed to send close command:", error.message);
          resolve();
          return;
        }
        // Safety timeout in case Deepgram never closes
        setTimeout(resolve, timeoutMs);
      });
    },

    getTranscript() {
      const combined =
        fullTranscript +
        (lastInterim ? (fullTranscript ? " " : "") + lastInterim : "");
      return combined.trim();
    },

    isConnected() {
      return isOpen && dgWs.readyState === WebSocket.OPEN;
    },
  };
}
