'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface WaitingPollClientProps {
  intervalMs?: number;
}

export default function WaitingPollClient({ intervalMs = 10000 }: WaitingPollClientProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [router, intervalMs]);

  return null;
}
