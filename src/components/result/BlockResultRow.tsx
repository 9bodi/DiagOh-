"use client";

interface BlockResultRowProps {
  index: number;
  name: string;
  score: number;
}

function getLevel(score: number): { label: string; tone: "success" | "warning" | "danger" } {
  if (score >= 1) return { label: "Maîtrisé", tone: "success" };
  if (score >= 0.75) return { label: "Fonctionnel", tone: "warning" };
  if (score >= 0.5) return { label: "Fragile", tone: "warning" };
  return { label: "Non maîtrisé", tone: "danger" };
}

const TONE_STYLES = {
  success: "bg-ohe-accent-soft text-ohe-accent border-ohe-accent/20",
  warning: "bg-ohe-panel-tint text-ohe-ink border-ohe-line",
  danger: "bg-red-50 text-red-700 border-red-200",
} as const;

export default function BlockResultRow({ index, name, score }: BlockResultRowProps) {
  const level = getLevel(score);
  const percent = score * 100;

  return (
    <div className="border-b border-ohe-line-soft py-5 last:border-b-0">
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <div className="flex items-baseline gap-3">
          <span
            className="text-ohe-muted"
            style={{ fontFamily: "var(--font-instrument-serif)", fontStyle: "italic", fontSize: "14px" }}
          >
            {String(index).padStart(2, "0")}
          </span>
          <h4 className="text-ohe-ink font-medium" style={{ fontFamily: "var(--font-instrument-sans)" }}>
            {name}
          </h4>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="text-ohe-ink"
            style={{ fontFamily: "var(--font-instrument-serif)", fontStyle: "italic", fontSize: "18px" }}
          >
            {(score * 8).toFixed(1).replace(".0", "")}/8
          </span>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${TONE_STYLES[level.tone]}`}
          >
            {level.label}
          </span>
        </div>
      </div>
      <div className="w-full h-[3px] bg-ohe-line-soft rounded-full overflow-hidden">
        <div
          className="h-full bg-ohe-accent transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
