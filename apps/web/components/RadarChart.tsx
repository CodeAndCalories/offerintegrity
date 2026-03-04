"use client";

interface RadarDataPoint {
  label: string;
  value: number;  // 0–10
  max?: number;   // default 10
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  className?: string;
}

export default function RadarChart({ data, size = 280, className = "" }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) * 0.72;
  const levels = 5;
  const n = data.length;

  function angleFor(i: number): number {
    return (Math.PI * 2 * i) / n - Math.PI / 2;
  }

  function toXY(angle: number, r: number): { x: number; y: number } {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  // Grid polygon points for each level
  function gridPoints(level: number): string {
    const r = (radius * level) / levels;
    return Array.from({ length: n }, (_, i) => {
      const { x, y } = toXY(angleFor(i), r);
      return `${x},${y}`;
    }).join(" ");
  }

  // Data polygon
  const dataPoints = data.map((d, i) => {
    const max = d.max ?? 10;
    const r = (d.value / max) * radius;
    return toXY(angleFor(i), r);
  });
  const dataPolyline = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Label positions (slightly outside radius)
  const labelOffset = radius * 1.22;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="100%"
      className={className}
      style={{ maxWidth: size, display: "block", margin: "0 auto" }}
      aria-label="Pillar radar chart"
    >
      {/* Grid rings */}
      {Array.from({ length: levels }, (_, i) => (
        <polygon
          key={i}
          points={gridPoints(i + 1)}
          fill="none"
          stroke="#222"
          strokeWidth="1"
        />
      ))}

      {/* Spokes */}
      {data.map((_, i) => {
        const { x, y } = toXY(angleFor(i), radius);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#222"
            strokeWidth="1"
          />
        );
      })}

      {/* Data area */}
      <polygon
        points={dataPolyline}
        fill="rgba(197,160,99,0.15)"
        stroke="#c5a063"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill="#c5a063"
        />
      ))}

      {/* Labels */}
      {data.map((d, i) => {
        const angle = angleFor(i);
        const { x, y } = toXY(angle, labelOffset);
        const textAnchor =
          Math.abs(Math.cos(angle)) < 0.15
            ? "middle"
            : Math.cos(angle) < 0
            ? "end"
            : "start";

        // Short label (first word of each pillar name)
        const shortLabel = d.label.split(" ")[0];
        const scoreLabel = `${d.value}/10`;

        return (
          <g key={i}>
            <text
              x={x}
              y={y - 4}
              textAnchor={textAnchor}
              fill="#9a8a6a"
              fontSize="9"
              fontFamily="monospace"
              letterSpacing="0.05em"
            >
              {shortLabel.toUpperCase()}
            </text>
            <text
              x={x}
              y={y + 8}
              textAnchor={textAnchor}
              fill="#c5a063"
              fontSize="9"
              fontFamily="monospace"
            >
              {scoreLabel}
            </text>
          </g>
        );
      })}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r="2" fill="#333" />
    </svg>
  );
}
