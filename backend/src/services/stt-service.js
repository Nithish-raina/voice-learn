// service for handling speech-to-text via Deepgram WebSocket
import WebSocket from "ws";
import logger from "../lib/logger.js";

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

  logger.info({ sampleRate }, "Creating Deepgram stream");

  if (!process.env.DEEPGRAM_API_KEY) {
    const error = new Error("Deepgram API key is not configured");
    logger.error("Deepgram API key is not configured");
    if (onError) onError(error);
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
    logger.debug({ model: "nova-2", sampleRate, encoding: "linear16" }, "Connecting to Deepgram WebSocket");
    dgWs = new WebSocket(`${DEEPGRAM_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to create Deepgram WebSocket");
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
  let chunksSent = 0;
  const connectStartTime = Date.now();

  // Timeout if Deepgram doesn't connect within threshold
  const connectionTimer = setTimeout(() => {
    if (!isOpen) {
      connectionTimedOut = true;
      logger.error({ timeoutMs: CONNECTION_TIMEOUT_MS }, "Deepgram connection timed out");
      const error = new Error("Speech-to-text service connection timed out");
      if (onError) onError(error);
      try {
        dgWs.close();
      } catch (e) {
        logger.error({ err: e }, "Error closing timed-out Deepgram connection");
      }
    }
  }, CONNECTION_TIMEOUT_MS);

  dgWs.on("open", () => {
    clearTimeout(connectionTimer);
    isOpen = true;
    const connectElapsed = Date.now() - connectStartTime;
    logger.info({ connectMs: connectElapsed }, "Deepgram stream opened");
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
            logger.debug({ transcriptLength: fullTranscript.length, isFinal }, "Deepgram final transcript chunk");
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
        logger.error({ description: response.description || response.message }, "Deepgram returned error");
        if (onError) onError(new Error(response.description || "Speech-to-text service error"));
      }
    } catch (error) {
      logger.error({ err: error }, "Failed to parse Deepgram message");
    }
  });

  dgWs.on("error", (error) => {
    clearTimeout(connectionTimer);
    logger.error({ err: error }, "Deepgram stream error");
    if (onError) onError(error);
  });

  dgWs.on("unexpected-response", (req, res) => {
    clearTimeout(connectionTimer);
    const statusCode = res.statusCode;
    logger.error({ statusCode }, "Deepgram unexpected response");
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
    logger.info({ code, reason: reasonStr, totalChunksSent: chunksSent, finalTranscriptLength: fullTranscript.length }, "Deepgram stream closed");
    if (closeResolve) closeResolve();
    if (onClose) onClose();
  });

  return {
    sendAudio(chunk) {
      if (isOpen && dgWs.readyState === WebSocket.OPEN) {
        try {
          dgWs.send(chunk);
          chunksSent++;
        } catch (error) {
          logger.error({ err: error, chunksSent }, "Failed to send audio chunk");
        }
      }
    },

    close() {
      if (isOpen && dgWs.readyState === WebSocket.OPEN) {
        try {
          logger.debug({ chunksSent }, "Sending Deepgram CloseStream");
          dgWs.send(JSON.stringify({ type: "CloseStream" }));
        } catch (error) {
          logger.error({ err: error }, "Failed to send close command");
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
          logger.debug({ chunksSent, timeoutMs }, "Sending Deepgram CloseStream and waiting");
          dgWs.send(JSON.stringify({ type: "CloseStream" }));
        } catch (error) {
          logger.error({ err: error }, "Failed to send close command");
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
