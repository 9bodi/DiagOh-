import Image from "next/image";

type LogoSize = number | "sm" | "md" | "lg";
interface LogoProps {
  size?: LogoSize;
  withLabel?: boolean;
  variant?: "default" | "white";
  href?: string;
}

const SIZE_MAP: Record<Exclude<LogoSize, number>, number> = { sm: 32, md: 48, lg: 64 };

export function Logo({ size = 48, withLabel = false, variant = "default" }: LogoProps) {
  const isWhite = variant === "white";
  const sizePx = typeof size === "number" ? size : SIZE_MAP[size];
  const width = Math.round(sizePx * (isWhite ? 1.98 : 1.9));
  const src = isWhite ? "/img/logos/logo-blanc.png" : "/img/logos/ohe-logo.png";

  return (
    <div className="inline-flex items-center gap-4">
      <Image
  src={src}
  alt="OHé — Orthographe Héros"
  width={width}
  height={sizePx}
  priority
/>

      {withLabel && (
        <span className={`ohe-caption ${isWhite ? "text-white opacity-90" : "text-ohe-accent opacity-75"}`}>
          Diagnostic
        </span>
      )}
    </div>
  );
}

export default Logo;
