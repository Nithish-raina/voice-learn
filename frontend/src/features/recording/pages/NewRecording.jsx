import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateSession } from "../hooks/useCreateSession";
import { useRecording } from "../hooks/useRecording";
import RecordingSetup from "../components/RecordingSetup";
import RecordingActive from "../components/RecordingActive";
import RecordingProcessing from "../components/RecordingProcessing";

export default function NewRecording() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("setup");
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("Programming");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [sessionId, setSessionId] = useState(null);
  const [presignedUrl, setPresignedUrl] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const { mutate: createSession, loading: creating } = useCreateSession();

  const { start, stop } = useRecording({
    sessionId,
    onStatus(stage) {
      setStatus(stage);
      if (stage === "ready") return;
      if (stage !== "complete") setPhase("processing");
    },
    onPartialResults(data) {
      // Store partial results and navigate to results page
      sessionStorage.setItem("partialResults", JSON.stringify(data));
    },
    onResults(data) {
      const partial = sessionStorage.getItem("partialResults");
      const combined = { ...JSON.parse(partial || "{}"), ...data };
      sessionStorage.setItem("fullResults", JSON.stringify(combined));
      navigate(`/sessions/${sessionId}`);
    },
    onError(err) {
      setError(err.message);
      setPhase("setup");
    },
  });

  async function handleStart() {
    if (!topic.trim()) {
      setError("Topic is required");
      return;
    }
    setError("");

    try {
      const data = await createSession({ topic, subject, difficulty });
      setSessionId(data.sessionId);
      setPresignedUrl(data.presignedUrl);

      // Small delay to ensure state is set before useRecording reads sessionId
      setTimeout(async () => {
        setPhase("recording");
      }, 100);
    } catch (err) {
      setError(
        err.response?.data?.error?.message || "Failed to create session",
      );
    }
  }

  async function handleStop() {
    const blob = stop();

    // Upload audio to S3 in background
    if (presignedUrl && blob.size > 0) {
      fetch(presignedUrl, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": "audio/webm" },
      }).catch(console.error);
    }

    setPhase("processing");
  }

  // Start recording after phase changes and sessionId is set
  if (phase === "recording" && sessionId && !stop.isRecording) {
    start().catch((err) => {
      setError(err.message);
      setPhase("setup");
    });
  }

  if (phase === "setup")
    return (
      <RecordingSetup
        topic={topic}
        setTopic={setTopic}
        subject={subject}
        setSubject={setSubject}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onStart={handleStart}
        loading={creating}
        error={error}
      />
    );
  if (phase === "recording")
    return <RecordingActive topic={topic} onStop={handleStop} />;
  return <RecordingProcessing status={status} />;
}
