'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  duration: number; // en secondes
  onExpire: () => void;
  resetKey: string | number; // change quand on passe à une nouvelle question pour reset le timer
}

export default function Timer({ duration, onExpire, resetKey }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [resetKey, duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Cercle SVG
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / duration) * circumference;

  const colorClass =
    timeLeft > 7
      ? 'stroke-ohe-blue'
      : timeLeft > 3
      ? 'stroke-ohe-orange'
      : 'stroke-red-500';

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          className="stroke-ohe-slate-200"
          strokeWidth="3"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          className={`${colorClass} transition-all duration-1000 ease-linear`}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </svg>
      <span className="relative font-mono text-base font-bold text-ohe-slate-900 tabular-nums">
        {timeLeft}
      </span>
    </div>
  );
}