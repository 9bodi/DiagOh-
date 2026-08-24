"use client";


interface ResultRadarProps {
  scores: {
    bloc1: number;
    bloc2: number;
    bloc3: number;
    bloc4: number;
    bloc5: number;
    bloc6: number;
  };
  size?: number;
}

const BLOCK_LABELS = [
  { key: "bloc1", short: "Singulier / Pluriel", full: "Singulier / Pluriel" },
  { key: "bloc2", short: "Conjugaison", full: "Conjugaison" },
  { key: "bloc3", short: "Participe passé", full: "Participe passé" },
  { key: "bloc4", short: "Orthographe lexicale", full: "Orthographe lexicale" },
  { key: "bloc5", short: "Syntaxe", full: "Syntaxe" },
  { key: "bloc6", short: "Compréhension", full: "Compréhension" },
] as const;

export default function ResultRadar({ scores, size = 560 }: ResultRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.28;
  const labelRadius = radius * 1.35;

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

  const gridLevels = [0.25, 0.5, 0.75, 1];

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
  viewBox={`-140 0 ${size + 280} ${size}`}
  className="w-full h-auto"
  role="img"
  aria-label="Radar des compétences procédurales"
>



        {/* Grid */}
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

        {/* Data polygon */}
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
          let textAnchor: "start" | "middle" | "end" = "middle";
          if (axis.labelX < cx - 5) textAnchor = "end";
          else if (axis.labelX > cx + 5) textAnchor = "start";

          // Split long labels on two lines
          const words = axis.short.split(" ");
          const isLong = axis.short.length > 12;
          const line1 = isLong && words.length > 1 ? words[0] : axis.short;
          const line2 = isLong && words.length > 1 ? words.slice(1).join(" ") : "";

          return (
            <g key={i}>
              <text
                x={axis.labelX}
                y={axis.labelY - (line2 ? 8 : 0)}
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
                {line1}
              </text>
              {line2 && (
                <text
                  x={axis.labelX}
                  y={axis.labelY + 6}
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
                  {line2}
                </text>
              )}
              <text
                x={axis.labelX}
                y={axis.labelY + (line2 ? 22 : 16)}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                className="fill-ohe-muted"
                style={{
                  fontFamily: "var(--font-instrument-serif)",
                  fontSize: "12px",
                  fontStyle: "italic",
                }}
              >
{Math.round(axis.value * 100)} %
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
