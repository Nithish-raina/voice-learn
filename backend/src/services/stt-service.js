// service for handling business logic related to rate limiting
import WebSocket from "ws";

const DEEPGRAM_URL = "wss://api.deepgram.com/v1/listen";

export function createDeepgramStream(options = {}) {
  const { onTranscript, onError, onClose, sampleRate = 16000 } = options;

  const params = new URLSearchParams({
    model: "nova-2",
    smart_format: "true",
    interim_results: "false",
    punctuate: "true",
    encoding: "linear16",
    sample_rate: String(sampleRate),
    channels: "1",
  });

  const dgWs = new WebSocket(`${DEEPGRAM_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
    },
  });

  let fullTranscript = "";
  let isOpen = false;

  dgWs.on("open", () => {
    isOpen = true;
    console.log("Deepgram stream opened");
  });

  dgWs.on("message", (data) => {
    try {
      const response = JSON.parse(data.toString());

      if (response.type === "Results") {
        const transcript = response.channel?.alternatives?.[0]?.transcript;
        if (transcript && transcript.trim()) {
          fullTranscript += (fullTranscript ? " " : "") + transcript.trim();

          if (onTranscript) {
            onTranscript({
              partial: transcript.trim(),
              full: fullTranscript,
              isFinal: response.is_final,
            });
          }
        }
      }
    } catch (error) {
      console.error("Deepgram message parse error:", error);
    }
  });

  dgWs.on("error", (error) => {
    console.error("Deepgram stream error:", error.message);
    if (onError) onError(error);
  });

  let closeResolve = null;

  dgWs.on("close", (code, reason) => {
    isOpen = false;
    console.log("Deepgram stream closed:", code, reason.toString());
    if (closeResolve) closeResolve();
    if (onClose) onClose();
  });

  return {
    sendAudio(chunk) {
      if (isOpen && dgWs.readyState === WebSocket.OPEN) {
        dgWs.send(chunk);
      }
    },

    close() {
      if (isOpen && dgWs.readyState === WebSocket.OPEN) {
        dgWs.send(JSON.stringify({ type: "CloseStream" }));
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
        dgWs.send(JSON.stringify({ type: "CloseStream" }));
        // Safety timeout in case Deepgram never closes
        setTimeout(resolve, timeoutMs);
      });
    },

    getTranscript() {
      return fullTranscript;
    },

    isConnected() {
      return isOpen && dgWs.readyState === WebSocket.OPEN;
    },
  };
}
