// websocket session handler for connecting with deepgram and managing real-time sessions
import { createDeepgramStream } from "../services/stt-service.js";
import { rateLimitService } from "../services/ratelimit-service.js";
import { sessionRepository } from "../repositories/session-repository.js";
import { SESSION_STATUS } from "../utils/constants.js";
import { s3 } from "../lib/s3-client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export function sessionHandler(ws, { sessionId, userId, session }) {
  let deepgram = null;
  let recordingStartTime = Date.now();
  let isStopped = false;
  let audioSampleRate = 16000;
  const audioChunks = [];

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

  function initDeepgram(sampleRate) {
    deepgram = createDeepgramStream({
      sampleRate,
      onTranscript({ partial, full }) {
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
  }

  sendStatus("ready");

  // Buffer audio until Deepgram is ready
  const pendingChunks = [];

  // Handle incoming messages
  ws.on("message", async (data, isBinary) => {
    if (isStopped) return;

    // Binary data = audio chunk
    if (isBinary) {
      audioChunks.push(Buffer.from(data));
      if (deepgram && deepgram.isConnected()) {
        deepgram.sendAudio(data);
      } else {
        pendingChunks.push(data);
      }
      return;
    }

    // Text data = JSON command
    try {
      const message = JSON.parse(data.toString());

      if (message.type === "audio_config") {
        audioSampleRate = message.sampleRate || 16000;
        console.log(`Audio sample rate: ${audioSampleRate}Hz`);

        // Now initialize Deepgram with the correct sample rate
        initDeepgram(audioSampleRate);

        // Flush any audio that arrived before Deepgram was ready
        // Small delay to let Deepgram WebSocket connect
        setTimeout(() => {
          for (const chunk of pendingChunks) {
            if (deepgram && deepgram.isConnected()) {
              deepgram.sendAudio(chunk);
            }
          }
          pendingChunks.length = 0;
        }, 500);
      } else if (message.type === "stop") {
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

    // Close Deepgram and wait for final transcript to flush
    if (deepgram) {
      await deepgram.closeAndWait();
    }

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

    // Upload audio to S3
    try {
      const pcmBuffer = Buffer.concat(audioChunks);
      const wavBuffer = createWavBuffer(pcmBuffer, audioSampleRate, 1, 16);
      const audioKey = `audio/${userId}/${sessionId}.wav`;

      const bucket = "voice-learn";
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: audioKey,
          Body: wavBuffer,
          ContentType: "audio/wav",
          ACL: "public-read",
        }),
      );

      await sessionRepository.update(sessionId, {
        audioUrl: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${audioKey}`,
      });
      console.log(`Audio uploaded: ${audioKey}`);
    } catch (error) {
      console.error("Audio upload failed:", error.message);
      // Don't fail the session — transcript and pipeline still work
    }

    // Update session with transcript and duration
    await sessionRepository.update(sessionId, {
      transcriptText: transcript,
      durationSeconds,
      status: SESSION_STATUS.PROCESSING,
    });

    sendStatus("extracting_concepts");

    // Run agent pipeline
    try {
      const { runPipeline } =
        await import("../services/agents/agent-pipeline.js");

      const result = await runPipeline({
        transcript,
        topic: session.topic,
        subject: session.subject,
        difficulty: session.difficulty,
        sessionId,
        userId,
        onStageComplete({ stage, data }) {
          sendResults("results_stage", { stage, ...data });
          if (stage === "concepts") {
            sendStatus("evaluating");
          }
        },
        onPartialResults(partialData) {
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

function createWavBuffer(pcmData, sampleRate, channels, bitsPerSample) {
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmData.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // subchunk1 size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcmData.length, 40);

  return Buffer.concat([header, pcmData]);
}
