import Image from 'next/image';
import Link from 'next/link';

import Countdown from '@/components/countdown';
import Ticker from '@/components/ticker';
import { getClubStats, getUpcomingEvents } from '@/lib/database/queries';
import { getCurrentProfile } from '@/lib/auth/guards';
import { formatEventDate } from '@/lib/format';

export const revalidate = 60; // next run + stats are fresh within a minute

export default async function HomePage() {
  const profile = await getCurrentProfile();
  const [events, stats] = await Promise.all([getUpcomingEvents(profile?.id), getClubStats()]);
  const next = events[0];

  const tickerStats: [string, string][] = [
    ['Members', String(stats.members)],
    ['Club miles logged', stats.clubMiles.toLocaleString()],
    ['Weekly runs', '2×'],
    ['Routes', '3 featured'],
    ['Founded', '2025 · Atlanta'],
  ];

  return (
    <>
      <div className="hero">
        <Image className="logo" src="/logo.png" alt="Two runners — TMR Club logo" width={110} height={110} priority />
        <div className="eyebrow on-dark">Atlanta · Est. by runners, for runners</div>
        <h1>
          Two Mile
          <br />
          <span className="outline">Run Club</span>
        </h1>
        <p>
          Accessible. Consistent. Inclusive. A community of like-minded people who show up, log
          miles, and push each other to improve — two miles at a time.
        </p>
        <div className="pills" style={{ marginTop: 28 }}>
          <Link className="pill solid" href="/auth/signup">
            Join the club
          </Link>
          <Link className="pill ghost" href="/runs">
            See upcoming runs
          </Link>
        </div>
      </div>

      <Ticker stats={tickerStats} />

      <div className="wrap content">
        <div className="section-head">
          <h2>Next Run</h2>
          <span className="eyebrow">Synced from Luma · luma.com/twomilerunclub-weekly-runs</span>
        </div>

        {next ? (
          <div className="nextrun">
            <div>
              <div className="eyebrow on-dark">Next up · {formatEventDate(next.starts_at).when}</div>
              <h3>{next.title}</h3>
              <div className="meta">
                📍 {next.location}
                {next.route_label ? ` · ${next.route_label}` : ''} · {next.attendees.length} going
              </div>
              <div style={{ marginTop: 16 }}>
                <Link className="btn sm" style={{ background: '#fff', color: '#0a0a0a' }} href="/runs">
                  RSVP on the Runs page
                </Link>
              </div>
            </div>
            <Countdown target={next.starts_at} />
          </div>
        ) : (
          <div className="locknote">
            <p style={{ margin: 0 }}>No runs on the calendar yet. Check back soon.</p>
          </div>
        )}

        <div className="section-head">
          <h2>About Us</h2>
        </div>
        <div className="grid3">
          <div className="card">
            <h3>Accessible</h3>
            <p className="muted">
              Two miles is the door in. No pace requirements, no gear checks — if you can show up,
              you can run with us.
            </p>
          </div>
          <div className="card">
            <h3>Consistent</h3>
            <p className="muted">
              Weekly runs, streak tracking, and a point system that rewards showing up more than
              showing off.
            </p>
          </div>
          <div className="card">
            <h3>Inclusive</h3>
            <p className="muted">
              Every level, every background. Founded by college student Ryan Bouapheng to build a
              community that improves each other.
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 26 }}>
          <Link className="btn line" href="/about">
            Read our full story →
          </Link>
        </div>
      </div>
    </>
  );
}
