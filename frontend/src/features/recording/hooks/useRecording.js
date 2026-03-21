import { useState, useRef } from "react";
import { getAccessToken } from "../../../api/client";

export function useRecording({
  sessionId,
  onResults,
  onPartialResults,
  onError,
  onStatus,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const wsRef = useRef(null);
  const mediaRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const processorRef = useRef(null);

  async function start() {
    const token = getAccessToken();
    const wsUrl = `${import.meta.env.VITE_WS_URL || "ws://localhost:3000"}/ws?sessionId=${sessionId}&token=${token}`;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    streamRef.current = stream;

    // MediaRecorder for S3 upload blob
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mediaRef.current = mediaRecorder;
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mediaRecorder.start(250);

    // AudioContext for raw PCM to send to Deepgram via WebSocket
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    processorRef.current = { audioContext, processor };

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsRecording(true);
      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const float32 = e.inputBuffer.getChannelData(0);
          const int16 = new Int16Array(float32.length);
          for (let i = 0; i < float32.length; i++) {
            int16[i] = Math.max(
              -32768,
              Math.min(32767, Math.floor(float32[i] * 32768)),
            );
          }
          ws.send(int16.buffer);
        }
      };
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "status") onStatus?.(msg.stage);
      if (msg.type === "results_partial") onPartialResults?.(msg.data);
      if (msg.type === "results_complete") onResults?.(msg.data);
      if (msg.type === "error") onError?.(msg.error);
    };

    ws.onerror = () =>
      onError?.({ code: "WS_ERROR", message: "Connection error" });
    ws.onclose = () => setIsRecording(false);
  }

  function stop() {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stop" }));
    }

    if (processorRef.current) {
      processorRef.current.processor.disconnect();
      processorRef.current.audioContext.close();
    }

    if (mediaRef.current?.state !== "inactive") {
      mediaRef.current?.stop();
    }

    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsRecording(false);

    // Return blob for S3 upload
    return new Blob(chunksRef.current, { type: "audio/webm" });
  }

  return { start, stop, isRecording };
}
