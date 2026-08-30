'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { toggleRsvp } from '@/lib/database/actions';
import { useToast } from '@/components/toast-provider';

export default function RsvpButton({
  eventId,
  going,
  signedIn,
}: {
  eventId: string;
  going: boolean;
  signedIn: boolean;
}) {
  const [pending, start] = useTransition();
  const toast = useToast();

  if (!signedIn) {
    return (
      <Link className="btn dark" href="/auth/signup">
        Sign up to RSVP
      </Link>
    );
  }

  return (
    <button
      className={`btn ${going ? 'line' : 'dark'}`}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await toggleRsvp(eventId);
          toast(res.ok ? res.message ?? 'Updated' : res.error);
        })
      }
    >
      {going ? '✓ Going — cancel' : 'RSVP'}
    </button>
  );
}
