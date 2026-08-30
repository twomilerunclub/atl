import Link from 'next/link';

/** Shown where the old site showed its "Members only" panel. */
export default function LockGate({ feature }: { feature: string }) {
  return (
    <div className="locknote">
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        Members only
      </div>
      <p style={{ maxWidth: 400, margin: '0 auto 18px' }}>
        {feature} is available to registered TMR runners. Guests can browse the Leaderboard and
        Routes.
      </p>
      <Link className="btn dark" href="/auth/signup">
        Join the club
      </Link>
      <Link className="btn line" href="/auth/login" style={{ marginLeft: 8 }}>
        Sign in
      </Link>
    </div>
  );
}
