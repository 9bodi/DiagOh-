"use client";

interface ResultRadarProps {
  scores: {
    bloc1: number; // 0, 0.5, 0.75, 1
    bloc2: number;
    bloc3: number;
    bloc4: number;
    bloc5: number;
    bloc6: number;
  };
  size?: number;
}

const BLOCK_LABELS = [
  { key: "bloc1", short: "Homophones", full: "Homophones grammaticaux" },
  { key: "bloc2", short: "Accords", full: "Accords sujet-verbe" },
  { key: "bloc3", short: "Conjugaison", full: "Conjugaison" },
  { key: "bloc4", short: "Lexical", full: "Orthographe lexicale" },
  { key: "bloc5", short: "Ponctuation", full: "Ponctuation" },
  { key: "bloc6", short: "Compréhension", full: "Compréhension" },
] as const;

export default function ResultRadar({ scores, size = 480 }: ResultRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;
  const labelRadius = radius * 1.28;

  // 6 axes, starting at top (-90°), clockwise
  const axes = BLOCK_LABELS.map((label, i) => {
    const angle = (-Math.PI / 2) + (i * (2 * Math.PI) / 6);
    return {
      ...label,
      angle,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      labelX: cx + Math.cos(angle) * labelRadius,
      labelY: cy + Math.sin(angle) * labelRadius,
      value: scores[label.key as keyof typeof scores],
    };
  });

  // Concentric grid levels (0.25, 0.5, 0.75, 1)
  const gridLevels = [0.25, 0.5, 0.75, 1];

  // Data polygon points
  const dataPoints = axes
    .map((axis) => {
      const r = radius * axis.value;
      const x = cx + Math.cos(axis.angle) * r;
      const y = cy + Math.sin(axis.angle) * r;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full flex justify-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[520px] h-auto"
        role="img"
        aria-label="Radar des compétences procédurales"
      >
        {/* Grid — concentric hexagons */}
        {gridLevels.map((level) => {
          const points = axes
            .map((axis) => {
              const r = radius * level;
              const x = cx + Math.cos(axis.angle) * r;
              const y = cy + Math.sin(axis.angle) * r;
              return `${x},${y}`;
            })
            .join(" ");
          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="var(--color-ohe-line)"
              strokeWidth={level === 1 ? 1.5 : 0.8}
              opacity={level === 1 ? 0.9 : 0.5}
            />
          );
        })}

        {/* Axes lines */}
        {axes.map((axis, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={axis.x}
            y2={axis.y}
            stroke="var(--color-ohe-line)"
            strokeWidth={0.8}
            opacity={0.5}
          />
        ))}

        {/* Data polygon fill */}
        <polygon
          points={dataPoints}
          fill="var(--color-ohe-accent)"
          fillOpacity={0.12}
          stroke="var(--color-ohe-accent)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data points */}
        {axes.map((axis, i) => {
          const r = radius * axis.value;
          const x = cx + Math.cos(axis.angle) * r;
          const y = cy + Math.sin(axis.angle) * r;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={6} fill="white" stroke="var(--color-ohe-accent)" strokeWidth={2} />
              <circle cx={x} cy={y} r={3} fill="var(--color-ohe-accent)" />
            </g>
          );
        })}

        {/* Labels */}
        {axes.map((axis, i) => {
          // Anchor based on position
          let textAnchor: "start" | "middle" | "end" = "middle";
          if (axis.labelX < cx - 5) textAnchor = "end";
          else if (axis.labelX > cx + 5) textAnchor = "start";

          return (
            <g key={i}>
              <text
                x={axis.labelX}
                y={axis.labelY}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                className="fill-ohe-ink"
                style={{
                  fontFamily: "var(--font-instrument-sans)",
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                }}
              >
                {axis.short}
              </text>
              <text
                x={axis.labelX}
                y={axis.labelY + 16}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                className="fill-ohe-muted"
                style={{
                  fontFamily: "var(--font-instrument-serif)",
                  fontSize: "12px",
                  fontStyle: "italic",
                }}
              >
                {(axis.value * 8).toFixed(1).replace(".0", "")}/8
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
