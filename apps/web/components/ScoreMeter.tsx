"use client";

interface ScoreMeterProps {
  score: number; // 0–100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getRiskLabel(score: number): { label: string; color: string } {
  if (score >= 70) return { label: "Low Risk", color: "#4ade80" };
  if (score >= 45) return { label: "Medium Risk", color: "#fbbf24" };
  return { label: "High Risk", color: "#f87171" };
}

export default function ScoreMeter({ score, size = "md", showLabel = true }: ScoreMeterProps) {
  const { label, color } = getRiskLabel(score);
  const clampedScore = Math.max(0, Math.min(100, score));

  const sizeMap = {
    sm: { bar: "h-1.5", text: "text-xs", gap: "gap-2" },
    md: { bar: "h-2", text: "text-xs", gap: "gap-3" },
    lg: { bar: "h-3", text: "text-sm", gap: "gap-3" },
  };
  const s = sizeMap[size];

  return (
    <div className={`flex flex-col ${s.gap}`}>
      <div className={`w-full ${s.bar} bg-[#1a1a1a] rounded-full overflow-hidden`}>
        <div
          className={`${s.bar} rounded-full transition-all duration-1000`}
          style={{
            width: `${clampedScore}%`,
            backgroundColor: color,
            opacity: 0.85,
          }}
        />
      </div>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={`mono ${s.text} text-parchment-muted`}>{clampedScore}%</span>
          <span className={`mono ${s.text} font-medium`} style={{ color }}>
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
