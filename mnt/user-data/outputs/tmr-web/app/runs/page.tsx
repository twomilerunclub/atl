import type { Metadata } from 'next';
import Link from 'next/link';

import Band from '@/components/band';
import RsvpButton from '@/components/rsvp-button';
import { getCurrentProfile } from '@/lib/auth/guards';
import { getUpcomingEvents } from '@/lib/database/queries';
import { formatEventDate, initials } from '@/lib/format';

export const metadata: Metadata = { title: 'Runs' };

export default async function RunsPage() {
  const profile = await getCurrentProfile();
  const events = await getUpcomingEvents(profile?.id);

  return (
    <>
      <Band
        eyebrow="Weekly runs"
        title="TMR Runs"
        sub="RSVP, see who's coming, and show up. Events sync with our Luma calendar."
      >
        <Link className="pill solid" href="/routes">
          Where we run
        </Link>
        <a
          className="pill ghost"
          href="https://luma.com/twomilerunclub-weekly-runs"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          View on Luma ↗
        </a>
      </Band>

      <div className="wrap content">
        {events.length === 0 ? (
          <div className="locknote">
            <p style={{ margin: 0 }}>No runs scheduled yet. New events post every Sunday.</p>
          </div>
        ) : (
          events.map((ev) => {
            const d = formatEventDate(ev.starts_at);
            return (
              <div className="event" key={ev.id}>
                <div className="datebox">
                  <div className="mo">{d.month}</div>
                  <div className="dy">{d.day}</div>
                </div>
                <div>
                  <b>{ev.title}</b>
                  <div className="muted" style={{ fontSize: 13, color: 'var(--steel)' }}>
                    {d.when} · 📍 {ev.location}
                    {ev.route_label ? (
                      <>
                        {' · '}
                        <span className="tag">{ev.route_label}</span>
                      </>
                    ) : null}
                  </div>
                  <div className="rsvp-faces">
                    {ev.attendees.slice(0, 6).map((a) => (
                      <span className="avatar" title={a.name} key={a.id}>
                        {initials(a.name)}
                      </span>
                    ))}
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--steel)',
                        marginLeft: 10,
                        alignSelf: 'center',
                      }}
                    >
                      {ev.attendees.length} going
                      {ev.attendees.length
                        ? `: ${ev.attendees
                            .slice(0, 3)
                            .map((a) => a.name.split(' ')[0])
                            .join(', ')}${ev.attendees.length > 3 ? ' + more' : ''}`
                        : ''}
                    </span>
                  </div>
                </div>
                <div className="ev-act">
                  <RsvpButton eventId={ev.id} going={ev.goingByMe} signedIn={Boolean(profile)} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
