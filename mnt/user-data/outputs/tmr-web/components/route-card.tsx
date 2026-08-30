'use client';

import { useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addRouteComment, toggleRouteLike } from '@/lib/database/actions';
import { useToast } from '@/components/toast-provider';
import type { ActionResult, RouteWithMeta } from '@/types';

function PostButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn sm dark" type="submit" disabled={pending}>
      Post
    </button>
  );
}

export default function RouteCard({
  route,
  featured,
  signedIn,
}: {
  route: RouteWithMeta;
  featured: boolean;
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const toast = useToast();
  const [state, formAction] = useFormState<ActionResult | null, FormData>(addRouteComment, null);

  const start0 = route.path_svg.split(/[M,\s]/).filter(Boolean);

  return (
    <div className="card">
      <div className="route-map">
        {featured ? <div className="featured-flag">★ Most liked — featured</div> : null}
        <svg viewBox="0 0 400 170" preserveAspectRatio="none" aria-hidden="true">
          <path d={route.path_svg} className="route-path" />
          <circle cx={start0[0]} cy={start0[1]} r="6" fill="var(--ink)" />
        </svg>
      </div>

      <h3>{route.name}</h3>
      <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
        <span className="tag">{route.distance_mi.toFixed(1)} mi</span>
        <span className="tag">↗ {route.elevation_ft} ft</span>
        <span className="tag">{route.surface}</span>
      </div>
      <p className="muted">{route.description}</p>

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          className={`btn sm ${route.likedByMe ? 'dark' : 'line'}`}
          disabled={pending}
          onClick={() =>
            signedIn
              ? start(async () => {
                  await toggleRouteLike(route.id);
                })
              : toast('Sign up to like routes')
          }
        >
          ♥ {route.likes}
        </button>
        <button className="btn sm line" onClick={() => setOpen((o) => !o)}>
          💬 {route.comments.length} reviews
        </button>
      </div>

      {open ? (
        <div style={{ marginTop: 12 }}>
          {route.comments.map((c) => (
            <div className="comment" key={c.id}>
              <b>{c.author}</b>
              <div>{c.body}</div>
            </div>
          ))}

          {signedIn ? (
            <>
              <form action={formAction} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input type="hidden" name="routeId" value={route.id} />
                <input
                  name="body"
                  placeholder="Leave a review…"
                  maxLength={1000}
                  required
                  style={{
                    flex: 1,
                    border: '1px solid var(--mist)',
                    borderRadius: 99,
                    padding: '8px 14px',
                  }}
                />
                <PostButton />
              </form>
              <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>
                {state && !state.ok ? state.error : 'Reviews appear after admin approval.'}
              </div>
            </>
          ) : (
            <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
              Sign up to like and review routes.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
