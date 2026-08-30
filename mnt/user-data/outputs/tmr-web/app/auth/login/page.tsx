import type { Metadata } from 'next';
import Link from 'next/link';

import AuthForm, { AuthShell, GoogleButton } from '@/components/auth-form';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  const next = searchParams.next;

  return (
    <AuthShell
      title="Sign in"
      sub="Welcome back. Your streak is waiting."
      alt={
        <>
          New here? <Link href="/auth/signup">Join the club</Link>
        </>
      }
    >
      {searchParams.error === 'oauth' ? (
        <div className="form-error">Google sign-in did not complete. Try again.</div>
      ) : null}

      <GoogleButton next={next} />
      <div className="auth-divider">or</div>

      <AuthForm action="signIn" label="Sign in" next={next}>
        <div className="field" style={{ marginBottom: 12 }}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <div style={{ textAlign: 'right', marginTop: 8, fontSize: 12 }}>
          <Link href="/auth/reset-password">Forgot your password?</Link>
        </div>
      </AuthForm>
    </AuthShell>
  );
}
