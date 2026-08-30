'use client';

import { useMemo, useState } from 'react';
import { initials } from '@/lib/format';
import type { LeaderboardRow } from '@/types';

/**
 * Search is the only interactive part, so the rows arrive pre-rendered from the
 * server and this component just filters them.
 */
export default function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => r.full_name.toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  return (
    <>
      <div className="searchbar">
        <input
          type="search"
          placeholder="Search runners by name…"
          aria-label="Search runners"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <table className="lb">
        <thead>
          <tr>
            <th>#</th>
            <th>Runner</th>
            <th>Runs</th>
            <th>Streak</th>
            <th className="pt" style={{ textAlign: 'right' }}>
              Points
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: 'var(--steel)', padding: 26 }}>
                No runners match that name. Clear the search to see the full list.
              </td>
            </tr>
          ) : (
            filtered.map((r) => (
              <tr key={r.user_id}>
                <td className="rk">{r.rank}</td>
                <td>
                  <span
                    className="avatar"
                    style={{ width: 26, height: 26, fontSize: 10, marginRight: 8 }}
                  >
                    {initials(r.full_name)}
                  </span>
                  {r.full_name}
                </td>
                <td>{r.runs}</td>
                <td>{r.streak ?? 0} wk</td>
                <td className="pt">{r.points}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
