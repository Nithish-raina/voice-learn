import ScoreRing from "../../../shared/components/ScoreRing";
import Pill from "../../../shared/components/Pill";
import SectionSkeleton from "../../../shared/components/SectionSkeleton";
import StrengthsGaps from "../../sessions/components/StrengthsGaps";
import TestYourself from "../../sessions/components/TestYourself";
import FlashcardPreview from "../../sessions/components/FlashcardPreview";
import ConceptsList from "./ConceptsList";
import { useIsMobile } from "../../../shared/hooks/useIsMobile";
import { C } from "../../../shared/styles/colors";

export default function StreamingResults({
  results,
  topic,
  subject,
  difficulty,
}) {
  const isMobile = useIsMobile();

  return (
    <div style={{ padding: isMobile ? 16 : 28, maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "center" : "flex-start",
          marginBottom: isMobile ? 16 : 20,
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontSize: isMobile ? 18 : 22,
              fontWeight: 700,
              marginBottom: 6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: isMobile ? "nowrap" : "normal",
            }}
          >
            {topic}
          </h2>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Pill>{subject}</Pill>
            <Pill color={C.amber} bg={C.amberDim}>
              {difficulty}
            </Pill>
          </div>
        </div>
        {results.score != null ? (
          <ScoreRing
            score={results.score}
            size={isMobile ? 60 : 76}
            strokeWidth={isMobile ? 4 : 5}
          />
        ) : (
          <div
            style={{
              width: isMobile ? 60 : 76,
              height: isMobile ? 60 : 76,
              borderRadius: "50%",
              border: `5px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse 1.5s ease-in-out infinite",
              flexShrink: 0,
            }}
          >
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
            <span style={{ fontSize: 11, color: C.textDim }}>...</span>
          </div>
        )}
      </div>

      {/* Concepts */}
      <div style={{ marginBottom: 16 }}>
        {results.concepts ? (
          <ConceptsList
            concepts={results.concepts}
            keyTerms={results.keyTerms}
          />
        ) : (
          <SectionSkeleton message="Extracting concepts..." height={120} />
        )}
      </div>

      {/* Strengths & Gaps */}
      <div style={{ marginBottom: 16 }}>
        {results.strengths != null && results.gaps != null ? (
          <StrengthsGaps strengths={results.strengths} gaps={results.gaps} />
        ) : (
          <SectionSkeleton
            message="Evaluating strengths and gaps..."
            height={100}
          />
        )}
      </div>

      {/* Test Yourself + Flashcards */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <div style={{ flex: 1 }}>
          {results.testYourselfQas ? (
            <TestYourself qas={results.testYourselfQas} />
          ) : (
            <SectionSkeleton
              message="Generating study materials..."
              height={140}
            />
          )}
        </div>
        <div style={{ flex: 1 }}>
          {results.flashcards ? (
            <FlashcardPreview flashcards={results.flashcards} />
          ) : (
            <SectionSkeleton
              message="Generating study materials..."
              height={140}
            />
          )}
        </div>
      </div>
    </div>
  );
}
