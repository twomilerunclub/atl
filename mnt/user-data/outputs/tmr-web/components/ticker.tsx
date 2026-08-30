/** Marquee of club stats. Pure presentation, so it stays a Server Component. */
export default function Ticker({ stats }: { stats: [string, string][] }) {
  const line = stats.map(([k, v]) => (
    <span key={k}>
      {k} <b>{v}</b>
    </span>
  ));

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-inner">
        {line}
        {line}
      </div>
    </div>
  );
}
