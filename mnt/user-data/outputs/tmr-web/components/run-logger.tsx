'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { logRun } from '@/lib/database/actions';
import { useToast } from '@/components/toast-provider';
import type { ActionResult } from '@/types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn dark" type="submit" disabled={pending}>
      {pending ? 'Logging…' : 'Log run'}
    </button>
  );
}

export default function RunLogger({ routes }: { routes: { id: string; name: string }[] }) {
  const [state, formAction] = useFormState<ActionResult | null, FormData>(logRun, null);
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!state) return;
    toast(state.ok ? state.message ?? 'Logged' : state.error);
    if (state.ok) formRef.current?.reset();
  }, [state, toast]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="card">
      <form action={formAction} ref={formRef}>
        <div className="formrow">
          <div className="field">
            <label htmlFor="lr-d">Date</label>
            <input id="lr-d" type="date" name="ranOn" defaultValue={today} required />
          </div>
          <div className="field">
            <label htmlFor="lr-dist">Distance (mi)</label>
            <input id="lr-dist" type="number" step="0.1" name="distanceMi" placeholder="2.0" required />
          </div>
          <div className="field">
            <label htmlFor="lr-t">Time (mm:ss)</label>
            <input id="lr-t" name="duration" placeholder="18:30" required />
          </div>
          <div className="field">
            <label htmlFor="lr-r">Route</label>
            <select id="lr-r" name="routeId" defaultValue="">
              {routes.map((r) => (
                <option value={r.id} key={r.id}>
                  {r.name}
                </option>
              ))}
              <option value="">Other</option>
            </select>
          </div>
        </div>
        {state && !state.ok ? <div className="field-error">{state.error}</div> : null}
        <SubmitButton />
        <span className="muted" style={{ fontSize: 12, marginLeft: 10 }}>
          Manual logs are approved by an admin before points post.
        </span>
      </form>
    </div>
  );
}
