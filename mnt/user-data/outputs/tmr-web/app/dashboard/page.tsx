import type { Metadata } from 'next';

import Band from '@/components/band';
import AdminPanel from '@/components/admin-panel';
import RunLogger from '@/components/run-logger';
import { requireProfile } from '@/lib/auth/guards';
import { getAdminQueues, getMyRuns, getMyStats, getRoutes } from '@/lib/database/queries';
import { pacePerMile, secondsToDuration, shortDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic'; // per-user data, never cached

export default async function DashboardPage() {
  const profile = await requireProfile();
  const [runs, stats, routes] = await Promise.all([
    getMyRuns(profile.id),
    getMyStats(profile.id),
    getRoutes(profile.id),
  ]);
  const queues = profile.role === 'admin' ? await getAdminQueues() : null;

  const maxWeek = Math.max(1, ...stats.weeklyMiles);
  const avgPace = stats.avgPaceSeconds
    ? `${Math.floor(stats.avgPaceSeconds / 60)}:${String(Math.round(stats.avgPaceSeconds % 60)).padStart(2, '0')}`
    : '—';

  return (
    <>
      <Band
        eyebrow="Members only"
        title="Dashboard"
        sub="Log runs, connect Strava, and watch your consistency compound."
      />

      <div className="wrap content">
        <div className="grid3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
          <div className="stat">
            <div className="k">{stats.totalMiles.toFixed(1)}</div>
            <div className="l">Total miles</div>
          </div>
          <div className="stat">
            <div className="k">{stats.avgWeeklyMiles.toFixed(1)}</div>
            <div className="l">Avg weekly mileage</div>
          </div>
          <div className="stat">
            <div className="k">{avgPace}</div>
            <div className="l">Avg pace /mi</div>
          </div>
          <div className="stat">
            <div className="k">{stats.streak} wk</div>
            <div className="l">Current streak 🔥</div>
          </div>
        </div>

        <div className="grid2" style={{ marginTop: 18 }}>
          <div className="chart-box">
            <div className="eyebrow">Consistency · weekly miles (8 wks)</div>
            <div className="bars" style={{ marginBottom: 24 }}>
              {stats.weeklyMiles.length === 0 ? (
                <div className="muted" style={{ fontSize: 13, alignSelf: 'center' }}>
                  Log your first run to start the chart.
                </div>
              ) : (
                stats.weeklyMiles.map((w, i) => (
                  <div
                    className={`b ${i < stats.weeklyMiles.length - 4 ? 'ghosted' : ''}`}
                    style={{ height: `${Math.round((w / maxWeek) * 100)}%` }}
                    key={i}
                  >
                    <span>{w}</span>
                  </div>
                ))
              )}
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              Weekly summary emailed every Sunday.
            </div>
          </div>

          <div className="chart-box">
            <div className="eyebrow">Speed progression · pace per run</div>
            <PaceChart runs={runs.slice(0, 6).reverse()} />
            <div className="muted" style={{ fontSize: 12 }}>
              Lower is faster. Milestone emails go out automatically when you level up.
            </div>
          </div>
        </div>

        <div className="section-head">
          <h2>Log a run</h2>
          <span className="eyebrow">Strava import coming from the connector</span>
        </div>
        <RunLogger routes={routes.map((r) => ({ id: r.id, name: r.name }))} />

        <div className="section-head">
          <h2>Run history</h2>
          <span className="eyebrow">Manual + Strava imports</span>
        </div>
        <div className="card">
          {runs.length === 0 ? (
            <div className="muted" style={{ fontSize: 13 }}>
              No runs logged yet. Your first one is the hard one.
            </div>
          ) : (
            runs.map((r) => (
              <div className="runrow" key={r.id}>
                <div>
                  <b>{r.distance_mi.toFixed(1)} mi</b> · {secondsToDuration(r.duration_seconds)}{' '}
                  <span className="muted" style={{ color: 'var(--steel)' }}>
                    ({pacePerMile(r.distance_mi, r.duration_seconds)})
                  </span>
                </div>
                <div className="muted" style={{ color: 'var(--steel)', fontSize: 13 }}>
                  {shortDate(r.ran_on)}
                  {r.route_label ? ` · ${r.route_label}` : ''}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {r.source === 'strava' ? (
                    <span className="tag dark">Strava · #{r.strava_activity_id?.slice(-4)}</span>
                  ) : (
                    <span className="tag">Manual</span>
                  )}
                  {r.status === 'pending' ? <span className="tag warn">Pending</span> : null}
                </div>
              </div>
            ))
          )}
        </div>

        {queues ? <AdminPanel queues={queues} /> : null}
      </div>
    </>
  );
}

/** Server-rendered SVG — no charting library, so nothing ships to the client. */
function PaceChart({ runs }: { runs: { distance_mi: number; duration_seconds: number }[] }) {
  if (runs.length < 2) {
    return (
      <div className="muted" style={{ fontSize: 13, padding: '30px 0' }}>
        Log a couple of runs and your pace trend appears here.
      </div>
    );
  }

  const paces = runs.map((r) => r.duration_seconds / r.distance_mi);
  const min = Math.min(...paces);
  const max = Math.max(...paces);
  const span = max - min || 1;
  const points = paces.map((p, i) => {
    const x = 10 + (i * 280) / (paces.length - 1);
    const y = 20 + ((p - min) / span) * 70;
    return [x, y] as const;
  });

  return (
    <svg
      viewBox="0 0 300 120"
      style={{ width: '100%', height: 130, marginTop: 14 }}
      aria-label="Pace trend across recent runs"
    >
      <polyline fill="none" stroke="var(--mist)" strokeWidth="1" points="0,100 300,100" />
      <polyline
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2.5"
        strokeLinecap="round"
        points={points.map(([x, y]) => `${x},${y}`).join(' ')}
      />
      {points.map(([x, y], i) => (
        <circle cx={x} cy={y} r="4" fill="var(--ink)" key={i} />
      ))}
    </svg>
  );
}
