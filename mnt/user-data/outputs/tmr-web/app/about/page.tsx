import type { Metadata } from 'next';
import Link from 'next/link';

import Band from '@/components/band';
import { getClubStats } from '@/lib/database/queries';

export const metadata: Metadata = { title: 'About' };
export const revalidate = 300;

export default async function AboutPage() {
  const stats = await getClubStats();

  return (
    <>
      <Band eyebrow="Our story" title="TMR Story" sub="How a two-mile loop became a community." />
      <div className="wrap content" style={{ maxWidth: 760 }}>
        <div className="card" style={{ padding: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            The start
          </div>
          <p style={{ marginBottom: 14 }}>
            Two Mile Run Club started with one college student and one simple idea.{' '}
            <b>Ryan Bouapheng</b> noticed that most run clubs quietly filter people out — the pace
            is too fast, the distance is too far, the vibe is too serious. So he flipped it: pick a
            distance anyone can finish, run it every week, and make the door as wide as possible.
          </p>
          <p style={{ marginBottom: 14 }}>
            Two miles is short enough to be a first run and long enough to matter. It&apos;s a
            warm-up for the marathoner and a milestone for the beginner — and on a TMR run, both are
            on the same route at the same time.
          </p>
          <div className="eyebrow" style={{ margin: '22px 0 10px' }}>
            The mission
          </div>
          <p style={{ marginBottom: 14 }}>
            Make running <b>accessible</b> (anyone can join), <b>consistent</b> (weekly runs,
            streaks, and points that reward showing up), and <b>inclusive</b> (every pace, every
            level, every background).
          </p>
          <div className="eyebrow" style={{ margin: '22px 0 10px' }}>
            The community
          </div>
          <p>
            TMR is built on the belief that like-minded people push each other to improve. The
            leaderboard, streaks, and badges aren&apos;t about beating each other — they&apos;re
            about not letting each other quit.
          </p>
        </div>

        <div className="grid3" style={{ marginTop: 18 }}>
          <div className="stat">
            <div className="k mono">{stats.members}</div>
            <div className="l">Active runners</div>
          </div>
          <div className="stat">
            <div className="k mono">2 mi</div>
            <div className="l">Every week, together</div>
          </div>
          <div className="stat">
            <div className="k mono">{stats.clubMiles.toLocaleString()}</div>
            <div className="l">Club miles logged</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <Link className="btn dark" href="/auth/signup">
            Join Two Mile Run Club
          </Link>
        </div>
      </div>
    </>
  );
}
