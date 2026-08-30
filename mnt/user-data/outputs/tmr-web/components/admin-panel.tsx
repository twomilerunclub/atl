'use client';

import { useTransition } from 'react';
import {
  approvePost,
  approveRouteComment,
  approveRun,
} from '@/lib/database/actions';
import { useToast } from '@/components/toast-provider';
import { pacePerMile, secondsToDuration, shortDate } from '@/lib/format';

type Queues = {
  runs: any[];
  comments: any[];
  posts: any[];
  suggestions: any[];
};

/** The admin approval queues, gated by requireAdmin() on the server AND by RLS. */
export default function AdminPanel({ queues }: { queues: Queues }) {
  const [pending, start] = useTransition();
  const toast = useToast();

  const run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) =>
    start(async () => {
      const res = await fn();
      toast(res.ok ? res.message ?? 'Done' : res.error ?? 'Something went wrong');
    });

  return (
    <>
      <div className="section-head">
        <h2>Admin</h2>
        <span className="eyebrow">Approvals &amp; roles</span>
      </div>

      <div className="admin-panel">
        <b style={{ fontSize: 14 }}>Pending run logs</b>
        {queues.runs.length ? (
          queues.runs.map((r) => (
            <div className="pending" key={r.id}>
              <span>
                {r.profiles?.full_name} · {Number(r.distance_mi).toFixed(1)} mi in{' '}
                {secondsToDuration(r.duration_seconds)} ({pacePerMile(Number(r.distance_mi), r.duration_seconds)}) on{' '}
                {shortDate(r.ran_on)}
              </span>
              <button className="btn sm dark" disabled={pending} onClick={() => run(() => approveRun(r.id))}>
                Approve +10 pts
              </button>
            </div>
          ))
        ) : (
          <div className="pending muted">Queue clear ✓</div>
        )}

        <b style={{ fontSize: 14, display: 'block', marginTop: 16 }}>Pending route reviews</b>
        {queues.comments.length ? (
          queues.comments.map((c) => (
            <div className="pending" key={c.id}>
              <span>
                {c.profiles?.full_name} on {c.routes?.name}: “{c.body}”
              </span>
              <button
                className="btn sm dark"
                disabled={pending}
                onClick={() => run(() => approveRouteComment(c.id))}
              >
                Approve
              </button>
            </div>
          ))
        ) : (
          <div className="pending muted">Queue clear ✓</div>
        )}

        <b style={{ fontSize: 14, display: 'block', marginTop: 16 }}>Pending blog posts</b>
        {queues.posts.length ? (
          queues.posts.map((p) => (
            <div className="pending" key={p.id}>
              <span>
                <b>{p.profiles?.full_name}</b>: “{p.caption}”
              </span>
              <button className="btn sm dark" disabled={pending} onClick={() => run(() => approvePost(p.id))}>
                Approve &amp; publish
              </button>
            </div>
          ))
        ) : (
          <div className="pending muted">Queue clear ✓</div>
        )}

        <b style={{ fontSize: 14, display: 'block', marginTop: 16 }}>Route suggestions</b>
        {queues.suggestions.length ? (
          queues.suggestions.map((s) => (
            <div className="pending" key={s.id}>
              <span>
                {s.profiles?.full_name} suggested <b>{s.name}</b> ({s.distance}
                {s.location ? ` · ${s.location}` : ''})
              </span>
            </div>
          ))
        ) : (
          <div className="pending muted">Queue clear ✓</div>
        )}
      </div>
    </>
  );
}
