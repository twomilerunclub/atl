import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell, GoogleButton } from '@/components/auth-form';
import RegistrationWizard from '@/components/registration-wizard';

export const metadata: Metadata = { title: 'Join TMR' };

export default function SignUpPage() {
  return (
    <AuthShell
      title="Join TMR"
      sub="Five short steps: your details, your running, where you are, safety, and the waiver."
      alt={
        <>
          Already a member? <Link href="/auth/login">Sign in</Link>
        </>
      }
    >
      <GoogleButton />
      <div className="auth-divider">or sign up with email</div>
      <RegistrationWizard />
    </AuthShell>
  );
}
