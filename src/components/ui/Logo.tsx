import Link from 'next/link';

interface LogoProps {
  href?: string;
  variant?: 'default' | 'white';
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ href = '/', variant = 'default', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const textColor = variant === 'white' ? 'text-white' : 'text-ohe-slate-900';

  const content = (
    <div className="inline-flex items-center gap-2">
      <span className={`${sizeClasses[size]} font-bold ${textColor}`}>OHé</span>
      <span className="px-2 py-0.5 bg-ohe-orange text-white text-xs font-bold rounded uppercase tracking-wide">
        Diag
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
