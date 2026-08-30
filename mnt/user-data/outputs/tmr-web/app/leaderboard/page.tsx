import type { Metadata } from 'next';

import Band from '@/components/band';
import LeaderboardTable from '@/components/leaderboard-table';
import { getLeaderboard } from '@/lib/database/queries';
import { POINT_RULES } from '@/lib/points';
import { initials } from '@/lib/format';

export const metadata: Metadata = { title: 'Leaderboard' };
export const revalidate = 30; // "live results" without hammering the database

export default async function LeaderboardPage() {
  const rows = await getLeaderboard();
  const top3 = rows.slice(0, 3);
  const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd — matches the original layout
  const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <>
      <Band
        eyebrow={
          <>
            <span className="live-dot" style={{ background: '#fff' }} />
            Live results · Resets monthly
          </>
        }
        title="Leaderboard"
        sub={`${month} standings. Points reward consistency, performance, streaks, and bringing friends.`}
      />

      <div className="wrap content">
        <div className="podium">
          {podiumOrder.map((i) => {
            const r = top3[i];
            if (!r) return null;
            return (
              <div className={`pod ${i === 0 ? 'first' : ''}`} key={r.user_id}>
                <div className="place">{i + 1}</div>
                <span className="avatar">{initials(r.full_name)}</span>
                <div className="name">{r.full_name}</div>
                <div className="sub" style={i === 0 ? { color: 'var(--steel)' } : undefined}>
                  {r.runs} runs · {r.streak ?? 0}-wk streak
                </div>
                <div className="pts mono">{r.points} pts</div>
              </div>
            );
          })}
        </div>

        <LeaderboardTable rows={rows} />

        <div className="section-head">
          <h2>How points work</h2>
          <span className="eyebrow">Single source of truth — same everywhere</span>
        </div>
        <div className="grid3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))' }}>
          {POINT_RULES.map((rule) => (
            <div className="card" key={rule.title}>
              <div className="mono" style={{ fontSize: 20, fontWeight: 600 }}>
                {rule.points}
                <span style={{ fontSize: 12, color: 'var(--steel)' }}> pts</span>
              </div>
              <b style={{ fontSize: 13 }}>{rule.title}</b>
              <div className="muted" style={{ fontSize: 12 }}>
                {rule.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
