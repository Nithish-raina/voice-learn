import { useState, useRef } from "react";
import { getAccessToken } from "../../../api/client";

export function useRecording({
  sessionId,
  onResults,
  onPartialResults,
  onStageComplete,
  onError,
  onStatus,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const wsRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);

  async function start(overrideSessionId) {
    const sid = overrideSessionId || sessionId;
    const token = getAccessToken();
    const wsUrl = import.meta.env.VITE_WS_URL
      ? `${import.meta.env.VITE_WS_URL}/ws?sessionId=${sid}&token=${token}`
      : `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws?sessionId=${sid}&token=${token}`;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    streamRef.current = stream;

    const audioContext = new AudioContext({ sampleRate: 16000 });
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    processorRef.current = { audioContext, processor };

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // Don't send anything here yet. Wait for the server to say "ready"
      setIsRecording(true);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "status") {
        if (msg.stage === "ready") {
          // Now the server's sessionHandler is fully initialized and listening
          ws.send(
            JSON.stringify({
              type: "audio_config",
              sampleRate: audioContext.sampleRate,
            }),
          );

          // Connect the audio graph to start processing chunks NOW
          const gainNode = audioContext.createGain();
          gainNode.gain.value = 0;

          source.connect(processor);
          processor.connect(gainNode);
          gainNode.connect(audioContext.destination);

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
        }
        onStatus?.(msg.stage);
      }
      if (msg.type === "results_partial") onPartialResults?.(msg.data);
      if (msg.type === "results_complete") onResults?.(msg.data);
      if (msg.type === "results_stage") onStageComplete?.(msg.data);
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

    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
  }

  return { start, stop, isRecording };
}
