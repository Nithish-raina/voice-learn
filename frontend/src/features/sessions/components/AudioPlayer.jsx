import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { C } from "../../../shared/styles/colors";

export default function AudioPlayer({ url }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  if (!url) return null;

  function toggle() {
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  }

  function fmt(s) {
    return `${Math.floor(s / 60)}:${Math.floor(s % 60)
      .toString()
      .padStart(2, "0")}`;
  }

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 10,
        background: C.card,
        border: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={() => setProgress(audioRef.current.currentTime)}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={toggle}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: C.primaryDim,
          border: `1px solid ${C.primaryBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {playing ? (
          <Pause size={14} color={C.primary} />
        ) : (
          <Play size={14} color={C.primary} />
        )}
      </button>
      <div
        style={{
          flex: 1,
          height: 6,
          borderRadius: 3,
          background: C.border,
          cursor: "pointer",
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          audioRef.current.currentTime =
            ((e.clientX - rect.left) / rect.width) * duration;
        }}
      >
        <div
          style={{
            width: `${duration ? (progress / duration) * 100 : 0}%`,
            height: "100%",
            borderRadius: 3,
            background: C.primary,
            transition: "width 0.1s",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 12,
          color: C.textDim,
          fontVariantNumeric: "tabular-nums",
          flexShrink: 0,
        }}
      >
        {fmt(progress)} / {fmt(duration)}
      </span>
    </div>
  );
}
