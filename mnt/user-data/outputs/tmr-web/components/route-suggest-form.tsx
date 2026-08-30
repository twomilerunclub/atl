'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { suggestRoute } from '@/lib/database/actions';
import { useToast } from '@/components/toast-provider';
import type { ActionResult } from '@/types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn dark" style={{ marginTop: 12 }} type="submit" disabled={pending}>
      {pending ? 'Sending…' : 'Submit suggestion'}
    </button>
  );
}

export default function RouteSuggestForm() {
  const [state, formAction] = useFormState<ActionResult | null, FormData>(suggestRoute, null);
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!state) return;
    toast(state.ok ? state.message ?? 'Sent' : state.error);
    if (state.ok) formRef.current?.reset();
  }, [state, toast]);

  return (
    <div className="card">
      <form action={formAction} ref={formRef}>
        <div className="formrow">
          <div className="field">
            <label htmlFor="sr-name">Route name</label>
            <input id="sr-name" name="name" placeholder="e.g. Piedmont Park Loop" required />
          </div>
          <div className="field">
            <label htmlFor="sr-dist">Distance</label>
            <input id="sr-dist" name="distance" placeholder="e.g. 2.0 mi" required />
          </div>
          <div className="field">
            <label htmlFor="sr-loc">Location</label>
            <input id="sr-loc" name="location" placeholder="Neighborhood / starting point" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="sr-why">Why this route?</label>
          <textarea id="sr-why" name="reason" rows={2} placeholder="Lighting, terrain, views…" />
        </div>
        {state && !state.ok ? <div className="field-error">{state.error}</div> : null}
        <SubmitButton />
      </form>
    </div>
  );
}
