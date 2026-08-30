'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { logReferral } from '@/lib/database/actions';
import { useToast } from '@/components/toast-provider';
import type { ActionResult } from '@/types';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn dark sm" type="submit" disabled={pending}>
      Log a referral
    </button>
  );
}

export default function ReferralButton() {
  const [state, formAction] = useFormState<ActionResult | null, FormData>(logReferral, null);
  const ref = useRef<HTMLFormElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!state) return;
    toast(state.ok ? state.message ?? 'Logged' : state.error);
    if (state.ok) ref.current?.reset();
  }, [state, toast]);

  return (
    <form action={formAction} ref={ref} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
      <input
        name="referredName"
        placeholder="Who did you bring?"
        required
        maxLength={120}
        style={{ flex: 1, border: '1px solid var(--mist)', borderRadius: 99, padding: '8px 14px', fontSize: 13 }}
      />
      <Submit />
    </form>
  );
}
