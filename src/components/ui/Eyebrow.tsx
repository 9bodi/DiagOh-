interface EyebrowProps {
  children: React.ReactNode;
  mark?: string | null;
  tone?: "muted" | "accent" | "ink";
  className?: string;
}

export function Eyebrow({ children, mark = "", tone = "muted", className = "" }: EyebrowProps) {
  const toneClass =
    tone === "accent" ? "text-ohe-accent" :
    tone === "ink" ? "text-ohe-ink" :
    "text-ohe-muted";

  return (
    <div className={`ohe-eyebrow inline-flex items-center gap-3 ${toneClass} ${className}`}>
      {mark && <span className="opacity-65">{mark}</span>}
      <span>{children}</span>
    </div>
  );
}

export default Eyebrow;
