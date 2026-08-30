import type { Metadata } from 'next';

import AuthForm, { AuthShell } from '@/components/auth-form';

export const metadata: Metadata = { title: 'Choose a new password' };

export default function UpdatePasswordPage() {
  return (
    <AuthShell
      title="New password"
      sub="Pick something at least 8 characters long."
      alt="You'll be signed in once it's saved."
    >
      <AuthForm action="updatePassword" label="Save password">
        <div className="field">
          <label htmlFor="password">New password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
        </div>
      </AuthForm>
    </AuthShell>
  );
}
