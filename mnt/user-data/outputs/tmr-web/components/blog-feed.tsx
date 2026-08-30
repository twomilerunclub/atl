'use client';

import { useEffect, useRef, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addPostComment, createPost, toggleReaction } from '@/lib/database/actions';
import { useToast } from '@/components/toast-provider';
import { initials, shortDate } from '@/lib/format';
import type { ActionResult, PostWithMeta } from '@/types';

const EMOJIS = ['🔥', '👏', '🏃', '❤️', '🎉'];

function SubmitPost() {
  const { pending } = useFormStatus();
  return (
    <button className="btn dark sm" type="submit" disabled={pending}>
      {pending ? 'Submitting…' : 'Submit post'}
    </button>
  );
}

export function PostComposer() {
  const [state, formAction] = useFormState<ActionResult | null, FormData>(createPost, null);
  const ref = useRef<HTMLFormElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!state) return;
    toast(state.ok ? state.message ?? 'Submitted' : state.error);
    if (state.ok) ref.current?.reset();
  }, [state, toast]);

  return (
    <div className="card" style={{ marginBottom: 22 }}>
      <h3>Share a run</h3>
      <form action={formAction} ref={ref}>
        <div className="field" style={{ marginTop: 8 }}>
          <textarea name="caption" rows={2} placeholder="Caption your run…" maxLength={2000} required />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
          <span className="muted" style={{ fontSize: 12 }}>
            Up to 3 photos per post.
          </span>
          <SubmitPost />
          <span className="muted" style={{ fontSize: 12 }}>
            Posts go live after admin approval.
          </span>
        </div>
      </form>
    </div>
  );
}

export function PostCard({ post }: { post: PostWithMeta }) {
  const [pending, start] = useTransition();
  const [, commentAction] = useFormState<ActionResult | null, FormData>(addPostComment, null);

  return (
    <article className="post">
      <div className="post-head">
        <span className="avatar">{initials(post.author)}</span>
        <div>
          <b style={{ fontSize: 14 }}>{post.author}</b>
          <div className="muted" style={{ fontSize: 12, color: 'var(--steel)' }}>
            {shortDate(post.created_at)}
          </div>
        </div>
      </div>

      {post.photos.length ? (
        <div
          className="photo-strip"
          style={
            post.photos.length === 1
              ? { gridTemplateColumns: '1fr' }
              : post.photos.length === 2
                ? { gridTemplateColumns: '1fr 1fr' }
                : undefined
          }
        >
          {post.photos.map((ph, i) => (
            <div className={`photo ${post.photos.length === 1 ? 'one' : ''}`} key={i}>
              📷 {ph}
            </div>
          ))}
        </div>
      ) : null}

      <div className="post-body" style={{ fontSize: 14 }}>
        {post.caption}
      </div>

      <div className="reacts">
        {EMOJIS.map((e) => {
          const count = post.reactions[e] ?? 0;
          const mine = post.myReactions.includes(e);
          return (
            <button
              className={`react ${mine ? 'mine' : ''}`}
              key={e}
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const fd = new FormData();
                  fd.set('postId', post.id);
                  fd.set('emoji', e);
                  await toggleReaction(fd);
                })
              }
            >
              {e}
              {count ? <span className="c">{count}</span> : null}
            </button>
          );
        })}
      </div>

      <div style={{ padding: '0 18px 16px' }}>
        {post.comments.map((c) => (
          <div className="comment" key={c.id}>
            <b>{c.author}</b>
            <div>{c.body}</div>
          </div>
        ))}
        <form action={commentAction} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input type="hidden" name="postId" value={post.id} />
          <input
            name="body"
            placeholder="Add a comment…"
            required
            maxLength={1000}
            style={{
              flex: 1,
              border: '1px solid var(--mist)',
              borderRadius: 99,
              padding: '8px 14px',
              fontSize: 13,
            }}
          />
          <button className="btn sm dark" type="submit">
            Post
          </button>
        </form>
      </div>
    </article>
  );
}
