// websocket session handler for connecting with deepgram and managing real-time sessions
import { createDeepgramStream } from "../services/stt-service.js";
import { rateLimitService } from "../services/ratelimit-service.js";
import { sessionRepository } from "../repositories/session-repository.js";
import { SESSION_STATUS } from "../utils/constants.js";

export function sessionHandler(ws, { sessionId, userId, session }) {
  let deepgram = null;
  let recordingStartTime = Date.now();
  let isStopped = false;

  // Send status to client
  function sendStatus(stage) {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ type: "status", stage }));
    }
  }

  function sendError(code, message) {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ type: "error", error: { code, message } }));
    }
  }

  function sendResults(type, data) {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ type, data }));
    }
  }

  // Initialize Deepgram stream
  deepgram = createDeepgramStream({
    onTranscript({ partial, full, isFinal }) {
      // Optionally send partial transcripts to frontend for real-time display
      if (ws.readyState === 1) {
        ws.send(
          JSON.stringify({
            type: "transcript_partial",
            data: { partial, full },
          }),
        );
      }
    },
    onError(error) {
      console.error("Deepgram error for session:", sessionId, error.message);
      sendError("STT_ERROR", "Speech-to-text service encountered an error");
    },
    onClose() {
      console.log("Deepgram closed for session:", sessionId);
    },
  });

  sendStatus("ready");

  // Handle incoming messages
  ws.on("message", async (data, isBinary) => {
    if (isStopped) return;

    // Binary data = audio chunk
    if (isBinary) {
      if (deepgram && deepgram.isConnected()) {
        deepgram.sendAudio(data);
      }
      return;
    }

    // Text data = JSON command
    try {
      const message = JSON.parse(data.toString());

      if (message.type === "stop") {
        isStopped = true;
        await handleStop();
      }
    } catch (error) {
      console.error("Invalid message:", error);
    }
  });

  // Handle disconnect
  ws.on("close", async () => {
    console.log(`WebSocket disconnected: session=${sessionId}`);

    if (!isStopped && deepgram) {
      // User disconnected without stopping — cleanup
      deepgram.close();

      // Mark session as abandoned if it's still in recording state
      try {
        const currentSession = await sessionRepository.findById(sessionId);
        if (
          currentSession &&
          currentSession.status === SESSION_STATUS.RECORDING
        ) {
          const durationSeconds = Math.floor(
            (Date.now() - recordingStartTime) / 1000,
          );
          await sessionRepository.update(sessionId, {
            status: SESSION_STATUS.ABANDONED,
            durationSeconds,
          });
          // Still record the usage
          if (durationSeconds > 0) {
            await rateLimitService.recordUsage(userId, durationSeconds);
          }
        }
      } catch (error) {
        console.error("Error handling abandoned session:", error);
      }
    }
  });

  async function handleStop() {
    sendStatus("transcribing");

    // Close Deepgram to flush remaining audio
    if (deepgram) {
      deepgram.close();
    }

    // Wait a moment for final transcript pieces
    await new Promise((r) => setTimeout(r, 500));

    const transcript = deepgram ? deepgram.getTranscript() : "";
    const durationSeconds = Math.floor(
      (Date.now() - recordingStartTime) / 1000,
    );

    console.log(
      `Recording stopped: session=${sessionId} duration=${durationSeconds}s transcript=${transcript.length} chars`,
    );

    // Update rate limit
    if (durationSeconds > 0) {
      await rateLimitService.recordUsage(userId, durationSeconds);
    }

    // If transcript is empty, mark as failed
    if (!transcript || transcript.trim().length === 0) {
      await sessionRepository.update(sessionId, {
        status: SESSION_STATUS.FAILED,
        durationSeconds,
      });
      sendError(
        "EMPTY_TRANSCRIPT",
        "No speech was detected in the recording. Please try again.",
      );
      return;
    }

    // Update session with transcript and duration
    await sessionRepository.update(sessionId, {
      transcriptText: transcript,
      durationSeconds,
      status: SESSION_STATUS.PROCESSING,
    });

    sendStatus("analyzing");

    // Run agent pipeline
    try {
      const { runPipeline } =
        await import("../services/agents/agentPipeline.js");

      const result = await runPipeline({
        transcript,
        topic: session.topic,
        subject: session.subject,
        difficulty: session.difficulty,
        sessionId,
        userId,
        onPartialResults(partialData) {
          // Send score, strengths, gaps as soon as they're ready
          sendResults("results_partial", partialData);
        },
      });

      // Send complete results
      sendResults("results_complete", {
        testYourselfQas: result.testYourselfQas,
        flashcards: result.flashcards,
      });

      sendStatus("complete");
    } catch (error) {
      console.error("Agent pipeline failed:", error);
      await sessionRepository.update(sessionId, {
        status: SESSION_STATUS.FAILED,
      });
      sendError(
        "PIPELINE_FAILED",
        "Analysis failed. Your recording has been saved. Please try again.",
      );
    }
  }
}
