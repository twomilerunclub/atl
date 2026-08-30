import type { Metadata } from 'next';

import Band from '@/components/band';
import ProfileVisibility from '@/components/profile-visibility';
import ReferralButton from '@/components/referral-button';
import { requireProfile } from '@/lib/auth/guards';
import { getMyBadges, getMyRuns, getMyStats } from '@/lib/database/queries';
import { BADGES } from '@/lib/points';
import { initials, shortDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Profile' };
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const profile = await requireProfile();
  const [runs, stats, earned] = await Promise.all([
    getMyRuns(profile.id),
    getMyStats(profile.id),
    getMyBadges(profile.id),
  ]);

  const joined = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
      <Band eyebrow="Members only" title="Profile" sub="Your story, your streak, your badges." />

      <div className="wrap content">
        <div className="grid2" style={{ gridTemplateColumns: '300px 1fr' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <span className="avatar" style={{ width: 88, height: 88, fontSize: 28, margin: '6px auto 14px' }}>
              {initials(profile.full_name)}
            </span>
            <h3 style={{ fontSize: 20 }}>{profile.full_name}</h3>
            <div className="muted">Member since {joined}</div>
            {profile.birthday ? <div className="muted">🎂 {shortDate(profile.birthday)}</div> : null}

            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '12px 0' }}>
              <span className="tag dark">{profile.role}</span>
              {profile.experience ? <span className="tag">{profile.experience}</span> : null}
            </div>

            <div
              style={{
                borderTop: '1px solid var(--fog)',
                paddingTop: 14,
                marginTop: 6,
                textAlign: 'left',
                fontSize: 13,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="muted">Goal</span>
                <b>{profile.goal ?? '—'}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="muted">Typical pace</span>
                <b className="mono">{profile.typical_pace ?? '—'}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="muted">Profile visibility</span>
                <ProfileVisibility profile={profile} />
              </div>
            </div>
          </div>

          <div>
            <div className="grid3" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
              <div className="stat">
                <div className="k">{stats.totalMiles.toFixed(1)}</div>
                <div className="l">Total miles</div>
              </div>
              <div className="stat">
                <div className="k">{stats.streak} wk</div>
                <div className="l">Current streak 🔥</div>
              </div>
              <div className="stat">
                <div className="k">{stats.runCount}</div>
                <div className="l">Approved runs</div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 14 }}>
              <h3>Recent activity</h3>
              {runs.slice(0, 4).map((r) => (
                <div className="runrow" key={r.id}>
                  <span>
                    🏃 Ran <b>{r.distance_mi.toFixed(1)} mi</b>
                    {r.route_label ? ` on the ${r.route_label}` : ''}
                  </span>
                  <span className="muted" style={{ color: 'var(--steel)', fontSize: 12 }}>
                    {shortDate(r.ran_on)}
                  </span>
                </div>
              ))}
              <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                Pulled live from your Dashboard run history.
              </div>
            </div>
          </div>
        </div>

        <div className="section-head">
          <h2>Achievement badges</h2>
          <span className="eyebrow">One-time challenges · shown on your profile</span>
        </div>
        <div className="grid3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))' }}>
          {BADGES.map((b) => {
            const got = earned.includes(b.slug);
            return (
              <div className={`badge ${got ? '' : 'locked'}`} key={b.slug}>
                <div className="ic">{got ? b.icon : '🔒'}</div>
                <b>{b.title}</b>
                <div className="d">{b.description}</div>
                <div className="p mono">
                  +{b.points} pts {got ? '· earned ✓' : ''}
                </div>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ marginTop: 18 }}>
          <h3>Referral program</h3>
          <p className="muted">
            Bring a new runner to TMR: <b>+25 pts</b> the moment they join, and <b>+15 more</b> once
            they&apos;ve attended 3+ runs. Milestone and leaderboard congratulations are emailed to
            you automatically.
          </p>
          <ReferralButton />
        </div>
      </div>
    </>
  );
}
