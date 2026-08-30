import type { Metadata } from 'next';
import Link from 'next/link';

import AuthForm, { AuthShell } from '@/components/auth-form';

export const metadata: Metadata = { title: 'Reset password' };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Reset password"
      sub="We'll email you a link to choose a new one."
      alt={
        <>
          Remembered it? <Link href="/auth/login">Sign in</Link>
        </>
      }
    >
      <AuthForm action="requestPasswordReset" label="Email me a reset link">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
      </AuthForm>
    </AuthShell>
  );
}
