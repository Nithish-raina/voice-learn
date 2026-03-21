import LoadingSpinner from "../../../shared/components/LoadingSpinner";

export default function RecordingProcessing({ status }) {
  const messages = {
    transcribing: "Transcribing your explanation...",
    analyzing: "AI agents analyzing your explanation...",
    extracting_concepts: "Extracting key concepts...",
    evaluating: "Evaluating accuracy and completeness...",
    scoring: "Generating your score and feedback...",
  };

  return <LoadingSpinner message={messages[status] || "Processing..."} />;
}
