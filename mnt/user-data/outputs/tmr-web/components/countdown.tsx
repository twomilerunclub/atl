'use client';

import { useEffect, useState } from 'react';

/** The only genuinely client-side bit of the hero: the live next-run clock. */
export default function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = now === null ? 0 : Math.max(0, new Date(target).getTime() - now);
  const cells: [number, string][] = [
    [Math.floor(diff / 864e5), 'days'],
    [Math.floor(diff / 36e5) % 24, 'hrs'],
    [Math.floor(diff / 6e4) % 60, 'min'],
    [Math.floor(diff / 1e3) % 60, 'sec'],
  ];

  return (
    <div className="count" suppressHydrationWarning>
      {cells.map(([n, label]) => (
        <div className="cell" key={label}>
          <div className="num">{String(n).padStart(2, '0')}</div>
          <div className="lab">{label}</div>
        </div>
      ))}
    </div>
  );
}
