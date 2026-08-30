'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { completeRegistration } from '@/lib/auth/actions';
import { useToast } from '@/components/toast-provider';
import type { ActionResult } from '@/types';

/**
 * The original five-step join flow, preserved step for step. Fields from earlier
 * steps stay mounted (hidden) so one submit carries the whole registration.
 */
const STEP_TITLES = [
  'Personal info',
  'Running experience',
  'Address',
  'Safety & survey',
  'Waiver & consent',
];

function SubmitStep({ last }: { last: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn dark" type="submit" disabled={pending || !last}>
      {pending ? 'Joining…' : 'Sign waiver & join TMR'}
    </button>
  );
}

export default function RegistrationWizard() {
  const [step, setStep] = useState(0);
  const [state, formAction] = useFormState<ActionResult | null, FormData>(completeRegistration, null);
  const toast = useToast();

  useEffect(() => {
    if (state?.ok && state.message) toast(state.message);
  }, [state, toast]);

  const last = step === STEP_TITLES.length - 1;

  return (
    <form action={formAction}>
      <div className="eyebrow">Step {step + 1} of {STEP_TITLES.length}</div>
      <h2 style={{ fontFamily: 'var(--disp)', textTransform: 'uppercase', fontSize: 18, margin: '4px 0' }}>
        {STEP_TITLES[step]}
      </h2>

      <div className="steps">
        {STEP_TITLES.map((t, i) => (
          <div className={`s ${i <= step ? 'done' : ''}`} key={t} />
        ))}
      </div>

      {state && !state.ok ? <div className="form-error">{state.error}</div> : null}
      {state?.ok && state.message ? <div className="form-error">{state.message}</div> : null}

      {/* Step 1 */}
      <div hidden={step !== 0}>
        <div className="formrow">
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" placeholder="First Last" required />
          </div>
          <div className="field">
            <label htmlFor="reg-email">Email</label>
            <input id="reg-email" name="email" type="email" placeholder="you@email.com" required />
          </div>
          <div className="field">
            <label htmlFor="reg-pass">Password</label>
            <input id="reg-pass" name="password" type="password" minLength={8} autoComplete="new-password" required />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" placeholder="(555) 555-5555" />
          </div>
          <div className="field">
            <label htmlFor="birthday">Birthday</label>
            <input id="birthday" name="birthday" type="date" />
          </div>
          <div className="field">
            <label htmlFor="gender">Gender</label>
            <select id="gender" name="gender" defaultValue="Prefer not to say">
              <option>Prefer not to say</option>
              <option>Woman</option>
              <option>Man</option>
              <option>Non-binary</option>
              <option>Self-describe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div hidden={step !== 1}>
        <div className="formrow">
          <div className="field">
            <label htmlFor="experience">Level</label>
            <select id="experience" name="experience" defaultValue="Brand new">
              <option>Brand new</option>
              <option>Casual</option>
              <option>Consistent</option>
              <option>Competitive</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="twoMileTime">Average 2-mile time</label>
            <input id="twoMileTime" name="twoMileTime" placeholder="e.g. 19:30 (or 'no idea yet!')" />
          </div>
          <div className="field">
            <label htmlFor="typicalPace">Typical pace</label>
            <input id="typicalPace" name="typicalPace" placeholder="e.g. 10:00 /mi" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="goal">Running goal</label>
          <input id="goal" name="goal" placeholder="e.g. run my first 5K, build a streak, make friends" />
        </div>
      </div>

      {/* Step 3 */}
      <div hidden={step !== 2}>
        <div className="formrow">
          <div className="field" style={{ gridColumn: '1/-1' }}>
            <label htmlFor="streetAddress">Street address</label>
            <input id="streetAddress" name="streetAddress" placeholder="123 Peachtree St" />
          </div>
          <div className="field">
            <label htmlFor="city">City</label>
            <input id="city" name="city" placeholder="Atlanta" />
          </div>
          <div className="field">
            <label htmlFor="region">State / Province</label>
            <input id="region" name="region" placeholder="GA" />
          </div>
          <div className="field">
            <label htmlFor="postalCode">ZIP</label>
            <input id="postalCode" name="postalCode" placeholder="30303" />
          </div>
          <div className="field">
            <label htmlFor="country">Country</label>
            <input id="country" name="country" placeholder="USA" />
          </div>
        </div>
      </div>

      {/* Step 4 */}
      <div hidden={step !== 3}>
        <div className="formrow">
          <div className="field">
            <label htmlFor="emergencyName">Emergency contact name</label>
            <input id="emergencyName" name="emergencyName" placeholder="Contact name" />
          </div>
          <div className="field">
            <label htmlFor="emergencyPhone">Emergency contact phone</label>
            <input id="emergencyPhone" name="emergencyPhone" type="tel" placeholder="(555) 555-5555" />
          </div>
        </div>
        <div className="field" style={{ marginBottom: 12 }}>
          <label htmlFor="medicalNotes">Medical conditions or allergies we should know about</label>
          <textarea
            id="medicalNotes"
            name="medicalNotes"
            rows={2}
            placeholder="Optional, kept private — only visible to run leads"
          />
        </div>
        <div className="formrow">
          <div className="field">
            <label htmlFor="heardAbout">How did you hear about TMR?</label>
            <select id="heardAbout" name="heardAbout" defaultValue="A friend / referral">
              <option>A friend / referral</option>
              <option>Instagram</option>
              <option>Luma</option>
              <option>Saw a run in person</option>
              <option>Other</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="excitedAbout">What are you most excited about?</label>
            <input id="excitedAbout" name="excitedAbout" placeholder="Community, consistency, the leaderboard…" />
          </div>
        </div>
        <div className="field">
          <label>Preferred training days</label>
          <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 13 }}>
            <label className="check" style={{ margin: 0 }}>
              <input type="checkbox" name="prefersWeekdays" defaultChecked /> Weekdays
            </label>
            <label className="check" style={{ margin: 0 }}>
              <input type="checkbox" name="prefersWeekends" defaultChecked /> Weekends
            </label>
          </div>
        </div>
      </div>

      {/* Step 5 */}
      <div hidden={step !== 4}>
        <label className="check">
          <input type="checkbox" name="fitnessAck" required /> I confirm I&apos;m physically fit to
          participate in club runs.
        </label>
        <label className="check">
          <input type="checkbox" name="riskAck" required /> I understand and assume the risks of
          group running (assumption of risk).
        </label>
        <label className="check">
          <input type="checkbox" name="conductAck" required /> I agree to the TMR code of conduct.
        </label>
        <label className="check">
          <input type="checkbox" name="termsAck" required /> I accept the privacy policy and terms.
        </label>
        <label className="check">
          <input type="checkbox" name="marketingOptin" /> I consent to appear in TMR marketing photos
          and footage (optional).
        </label>
        <div className="formrow" style={{ marginTop: 14 }}>
          <div className="field">
            <label htmlFor="signature">Signature (type your full name)</label>
            <input id="signature" name="signature" placeholder="Your full name" required={last} />
          </div>
        </div>
      </div>

      <div className="foot">
        <button
          type="button"
          className="btn line"
          style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </button>
        {last ? (
          <SubmitStep last={last} />
        ) : (
          <button type="button" className="btn dark" onClick={() => setStep((s) => s + 1)}>
            Continue
          </button>
        )}
      </div>
    </form>
  );
}
