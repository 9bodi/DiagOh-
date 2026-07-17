interface BadgeProps {
  children: React.ReactNode;
  tone?: "accent" | "muted";
}

export function Badge({ children, tone = "accent" }: BadgeProps) {
  const toneClass =
    tone === "accent"
      ? "text-ohe-accent border-ohe-accent bg-ohe-accent-soft"
      : "text-ohe-muted border-ohe-line bg-transparent";

  return (
    <span
      className={`ohe-caption px-3 py-1.5 rounded-full border ${toneClass}`}
      style={{ letterSpacing: "0.24em" }}
    >
      {children}
    </span>
  );
}

export default Badge;
