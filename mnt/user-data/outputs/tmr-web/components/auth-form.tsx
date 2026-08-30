'use client';

import { useFormState, useFormStatus } from 'react-dom';
import {
  signIn,
  signInWithGoogle,
  signUp,
  requestPasswordReset,
  updatePassword,
} from '@/lib/auth/actions';
import type { ActionResult } from '@/types';

const ACTIONS = { signIn, signUp, requestPasswordReset, updatePassword } as const;

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="btn dark"
      type="submit"
      disabled={pending}
      style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
    >
      {pending ? 'Working…' : label}
    </button>
  );
}

export default function AuthForm({
  action,
  label,
  next,
  children,
}: {
  action: keyof typeof ACTIONS;
  label: string;
  next?: string;
  children: React.ReactNode;
}) {
  const [state, formAction] = useFormState<ActionResult | null, FormData>(ACTIONS[action], null);

  return (
    <form action={formAction}>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state && !state.ok ? <div className="form-error">{state.error}</div> : null}
      {state && state.ok && state.message ? <div className="form-error">{state.message}</div> : null}

      {children}

      {state && !state.ok && state.fieldErrors
        ? Object.entries(state.fieldErrors).map(([field, messages]) => (
            <div className="field-error" key={field}>
              {messages[0]}
            </div>
          ))
        : null}

      <Submit label={label} />
    </form>
  );
}

export function GoogleButton({ next }: { next?: string }) {
  return (
    <form action={signInWithGoogle}>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <button className="btn line" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6Z" />
          <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A12 12 0 0 0 12 24Z" />
          <path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.7l3.8-3Z" />
          <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.6 11.6 0 0 0 12 0 12 12 0 0 0 1.8 6.1l3.8 3c.9-2.7 3.4-4.3 6.4-4.3Z" />
        </svg>
        Continue with Google
      </button>
    </form>
  );
}

export function AuthShell({
  title,
  sub,
  children,
  alt,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
  alt: React.ReactNode;
}) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="eyebrow">Two Mile Run Club</div>
        <h1>{title}</h1>
        <p className="muted" style={{ fontSize: 13, marginBottom: 18 }}>
          {sub}
        </p>
        {children}
      </div>
      <div className="auth-alt">{alt}</div>
    </div>
  );
}
