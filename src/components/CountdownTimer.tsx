'use client';

import { useEffect, useState } from 'react';

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
      <div className="countdown-pill">
        Tomorrow's totka unlocks in <span>{timeLeft}</span>
      </div>
    </div>
  );
}
