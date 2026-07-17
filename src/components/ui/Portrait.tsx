import Image from "next/image";

interface PortraitProps {
  initials?: string;
  size?: number;
  src?: string;
  alt?: string;
}

export function Portrait({ initials = "RJ", size = 42, src, alt }: PortraitProps) {
  if (src) {
    return (
      <div
        className="rounded-full overflow-hidden border border-ohe-line shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt={alt ?? "Portrait"}
          width={size}
          height={size}
          className="object-cover"
          style={{ width: size, height: size }}
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-full grid place-items-center font-serif italic text-ohe-ink border border-ohe-line shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `repeating-linear-gradient(135deg, var(--color-ohe-accent-soft), var(--color-ohe-accent-soft) 4px, transparent 4px, transparent 8px), var(--color-ohe-line-soft)`,
      }}
    >
      {initials}
    </div>
  );
}

export default Portrait;
