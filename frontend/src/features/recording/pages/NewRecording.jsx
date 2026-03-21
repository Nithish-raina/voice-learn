import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateSession } from "../hooks/useCreateSession";
import { useRecording } from "../hooks/useRecording";
import RecordingSetup from "../components/RecordingSetup";
import RecordingActive from "../components/RecordingActive";
import RecordingProcessing from "../components/RecordingProcessing";
import StreamingResults from "../components/StreamingResults";

export default function NewRecording() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("setup");
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("Programming");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState({
    concepts: null,
    keyTerms: null,
    score: null,
    strengths: null,
    gaps: null,
    testYourselfQas: null,
    flashcards: null,
  });

  const { mutate: createSession, loading: creating } = useCreateSession();

  const { start, stop } = useRecording({
    sessionId,
    onStatus(stage) {
      setStatus(stage);
      if (stage === "ready") return;
      if (stage !== "complete") setPhase("processing");
    },
    onStageComplete(data) {
      setResults((prev) => ({ ...prev, ...data }));
      setPhase("results");
    },
    onPartialResults(data) {
      setResults((prev) => ({ ...prev, ...data }));
      setPhase("results");
    },
    onResults(data) {
      setResults((prev) => {
        const final = { ...prev, ...data };
        navigate(`/sessions/${sessionId}`, {
          replace: true,
          state: { streamedResults: final },
        });
        return final;
      });
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
    stop();
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
  if (phase === "results")
    return (
      <StreamingResults
        results={results}
        topic={topic}
        subject={subject}
        difficulty={difficulty}
      />
    );
  return <RecordingProcessing status={status} />;
}
