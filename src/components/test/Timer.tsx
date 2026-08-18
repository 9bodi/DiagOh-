'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  duration: number;
  onExpire: () => void;
  resetKey: string | number;
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

  const size = 110;
  const radius = 50;


  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / duration) * circumference;

  // Palette monochrome accent + rouge critique
  const strokeColor =
    timeLeft <= 3
      ? '#DC2626'                       // rouge critique
      : timeLeft <= 7
      ? 'var(--color-ohe-ink)'          // encre : attention
      : 'var(--color-ohe-accent)';      // bleu marine : normal

  const textColor = timeLeft <= 3 ? 'text-red-600' : 'text-ohe-ink';

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Piste de fond */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-ohe-line)"
          strokeWidth="3"
        />
        {/* Anneau de progression */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
                  <span
        className={`relative font-serif italic text-[44px] tabular-nums ${textColor}`}
      >
        {timeLeft}
      </span>
    </div>
  );
}
