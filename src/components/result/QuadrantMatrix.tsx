"use client";

interface QuadrantMatrixProps {
  quadrant: 1 | 2 | 3 | 4;
  scoreAdaptation: number;
  scoreInteret: number;
}

// TODO OHé : valider les libellés des 4 quadrants au recap
const QUADRANTS = {
  1: { label: "Engagé·e et adaptable", tagline: "Fort intérêt, forte adaptation" },
  2: { label: "Motivé·e à outiller", tagline: "Fort intérêt, adaptation à renforcer" },
  3: { label: "À sensibiliser", tagline: "Intérêt à développer, adaptation à renforcer" },
  4: { label: "Autonome à mobiliser", tagline: "Intérêt à développer, forte adaptation" },
} as const;

export default function QuadrantMatrix({ quadrant, scoreAdaptation, scoreInteret }: QuadrantMatrixProps) {
  const current = QUADRANTS[quadrant];

  const cells = [
    { id: 2 as const },
    { id: 1 as const },
    { id: 3 as const },
    { id: 4 as const },
  ];

  return (
    <div className="w-full">
      <div className="relative aspect-square max-w-[420px] mx-auto">
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
          <span className="ohe-eyebrow text-ohe-muted whitespace-nowrap">Intérêt →</span>
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
          <span className="ohe-eyebrow text-ohe-muted whitespace-nowrap">Adaptation →</span>
        </div>

        <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
          {cells.map((cell) => {
            const isActive = cell.id === quadrant;
            const data = QUADRANTS[cell.id];
            return (
              <div
                key={cell.id}
                className={`
                  relative border rounded-2xl p-4 flex flex-col justify-center items-center text-center transition
                  ${isActive
                    ? "bg-ohe-accent text-white border-ohe-accent shadow-lg"
                    : "bg-ohe-panel-tint border-ohe-line text-ohe-muted"
                  }
                `}
              >
                <span
                  className="ohe-eyebrow mb-2"
                  style={{ color: isActive ? "rgba(255,255,255,0.7)" : undefined }}
                >
                  Q{cell.id}
                </span>
                <p
                  className={`text-sm font-medium leading-tight ${isActive ? "text-white" : "text-ohe-ink"}`}
                  style={{ fontFamily: "var(--font-instrument-sans)" }}
                >
                  {data.label}
                </p>
                {isActive && (
                  <p className="text-xs mt-2 opacity-80 italic" style={{ fontFamily: "var(--font-instrument-serif)" }}>
                    Votre profil
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 border border-ohe-line rounded-2xl p-6 bg-white">
        <div className="ohe-eyebrow text-ohe-accent mb-2">Votre profil</div>
        <h3
          className="text-2xl text-ohe-ink mb-1"
          style={{ fontFamily: "var(--font-instrument-serif)", fontStyle: "italic" }}
        >
          {current.label}
        </h3>
        <p className="text-sm text-ohe-muted mb-4">{current.tagline}</p>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="ohe-caption text-ohe-muted">Adaptation</span>
            <p className="text-ohe-ink font-medium">{scoreAdaptation}/5</p>
          </div>
          <div>
            <span className="ohe-caption text-ohe-muted">Intérêt</span>
            <p className="text-ohe-ink font-medium">{scoreInteret}/5</p>
          </div>
        </div>
      </div>
    </div>
  );
}
