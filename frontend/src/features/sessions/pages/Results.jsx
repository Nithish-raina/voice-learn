import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import ScoreRing from "../../../shared/components/ScoreRing";
import Pill from "../../../shared/components/Pill";
import StrengthsGaps from "../components/StrengthsGaps";
import Transcript from "../components/Transcript";
import AudioPlayer from "../components/AudioPlayer";
import TestYourself from "../components/TestYourself";
import FlashcardPreview from "../components/FlashcardPreview";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import { ArrowLeft } from "lucide-react";
import { C } from "../../../shared/styles/colors";

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const streamedResults = location.state?.streamedResults;

  const { data: apiSession, loading } = useSession(id);

  // Prefer API data as base, overlay streamed results if present
  const session = apiSession
    ? { ...apiSession, ...(streamedResults || {}) }
    : streamedResults || null;

  if (loading && !streamedResults)
    return <LoadingSpinner message="Loading results..." />;
  if (!session)
    return (
      <div style={{ padding: 28 }}>
        <p style={{ color: C.textDim }}>Session not found</p>
      </div>
    );

  return (
    <div style={{ padding: 28, maxWidth: 960, margin: "0 auto" }}>
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: C.textDim,
          fontSize: 13,
          cursor: "pointer",
          padding: 0,
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            {session.topic}
          </h2>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Pill>{session.subject}</Pill>
            <Pill color={C.amber} bg={C.amberDim}>
              {session.difficulty}
            </Pill>
            {session.createdAt && (
              <span style={{ fontSize: 12, color: C.textDim, marginLeft: 4 }}>
                {new Date(session.createdAt).toLocaleDateString()} ·{" "}
                {Math.floor(session.durationSeconds / 60)}m{" "}
                {session.durationSeconds % 60}s
              </span>
            )}
          </div>
        </div>
        <ScoreRing score={session.score || 0} size={76} strokeWidth={5} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <StrengthsGaps strengths={session.strengths} gaps={session.gaps} />
      </div>
      {session.transcriptText && (
        <div style={{ marginBottom: 12 }}>
          <Transcript text={session.transcriptText} />
        </div>
      )}
      {session.audioUrl && (
        <div style={{ marginBottom: 16 }}>
          <AudioPlayer url={session.audioUrl} />
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <TestYourself qas={session.testYourselfQas} />
        </div>
        <div style={{ flex: 1 }}>
          <FlashcardPreview flashcards={session.flashcards} />
        </div>
      </div>
    </div>
  );
}
