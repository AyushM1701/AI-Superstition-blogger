'use client';

import { useEffect, useState } from 'react';

function HourglassIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true" style={{ opacity: 0.65, flexShrink: 0 }}>
      <path
        d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"
        stroke="var(--text-secondary)"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const now = new Date();
      
      // 12:00 AM IST is 18:30:00 UTC
      const nextUpdateUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 18, 30, 0, 0));
      
      // If we are already past 18:30 UTC today, the next update is tomorrow at 18:30 UTC
      if (now.getTime() >= nextUpdateUtc.getTime()) {
        nextUpdateUtc.setUTCDate(nextUpdateUtc.getUTCDate() + 1);
      }
      
      const diff = nextUpdateUtc.getTime() - now.getTime();
      
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
      const minutes = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
      const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
      
      return `${hours}:${minutes}:${seconds}`;
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    // Render a placeholder with the same height to avoid layout shift on hydration
    return <div style={{ height: '28px', margin: '1.5rem 0' }} aria-hidden="true" />;
  }

  return (
    <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
      <div className="countdown-timer">
        <div style={{ display: 'flex', transform: 'translateY(1px)' }}>
          <HourglassIcon />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
          <span className="countdown-label">Tomorrow&apos;s totka unlocks in</span>
          <span className="countdown-digits">{timeLeft}</span>
        </div>
      </div>
    </div>
  );
}
