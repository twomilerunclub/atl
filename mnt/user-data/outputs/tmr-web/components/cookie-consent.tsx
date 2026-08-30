'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { saveConsent } from '@/lib/cookies/actions';
import {
  CATEGORY_COPY,
  type ConsentCategory,
  type ConsentState,
} from '@/lib/cookies/registry';

type Choices = Record<Exclude<ConsentCategory, 'necessary'>, boolean>;

const ALL_ON: Choices = { functional: true, analytics: true, marketing: true };
const ALL_OFF: Choices = { functional: false, analytics: false, marketing: false };

/**
 * Banner + preference centre. Nothing beyond the necessary cookies loads until
 * a choice is recorded, and the footer link reopens this at any time.
 */
export default function CookieConsent({ initialConsent }: { initialConsent: ConsentState | null }) {
  const [decided, setDecided] = useState(Boolean(initialConsent));
  const [panelOpen, setPanelOpen] = useState(false);
  const [choices, setChoices] = useState<Choices>(
    initialConsent
      ? {
          functional: initialConsent.functional,
          analytics: initialConsent.analytics,
          marketing: initialConsent.marketing,
        }
      : ALL_OFF
  );
  const [pending, setPending] = useState(false);

  // Lets the footer button (a server component) reopen the panel.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest('[data-open-cookie-preferences]');
      if (el) {
        e.preventDefault();
        setPanelOpen(true);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const commit = useCallback(async (next: Choices) => {
    setPending(true);
    await saveConsent(next);
    setChoices(next);
    setDecided(true);
    setPanelOpen(false);
    setPending(false);
    // Non-essential scripts read this event and self-initialise only if allowed.
    window.dispatchEvent(new CustomEvent('tmr:consent', { detail: next }));
  }, []);

  if (decided && !panelOpen) return null;

  return (
    <>
      {!decided && !panelOpen ? (
        <div className="cookie-bar" role="region" aria-label="Cookie consent">
          <div className="inner">
            <p>
              We use cookies that keep you signed in, plus optional ones that help us see which
              routes runners care about. Read the{' '}
              <Link href="/legal/cookies">cookie policy</Link>.
            </p>
            <div className="acts">
              <button className="btn line sm" onClick={() => setPanelOpen(true)} disabled={pending}>
                Customize
              </button>
              <button className="btn line sm" onClick={() => commit(ALL_OFF)} disabled={pending}>
                Reject non-essential
              </button>
              <button
                className="btn sm"
                style={{ background: 'var(--white)', color: 'var(--ink)' }}
                onClick={() => commit(ALL_ON)}
                disabled={pending}
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {panelOpen ? (
        <div
          className="overlay open"
          role="dialog"
          aria-modal="true"
          aria-label="Cookie preferences"
          onClick={(e) => e.target === e.currentTarget && setPanelOpen(false)}
        >
          <div className="modal cookie-panel">
            <div className="eyebrow">Your choices</div>
            <h2>Cookie preferences</h2>

            {(Object.keys(CATEGORY_COPY) as ConsentCategory[]).map((key) => {
              const copy = CATEGORY_COPY[key];
              const on = copy.alwaysOn ? 'locked' : String(choices[key as keyof Choices]);
              return (
                <div className="cookie-row" key={key}>
                  <div>
                    <b>{copy.title}</b>
                    <p>{copy.description}</p>
                  </div>
                  <button
                    type="button"
                    className="switch"
                    data-on={on}
                    aria-label={`${copy.title} cookies`}
                    aria-pressed={copy.alwaysOn ? true : choices[key as keyof Choices]}
                    disabled={copy.alwaysOn}
                    onClick={() =>
                      !copy.alwaysOn &&
                      setChoices((c) => ({ ...c, [key]: !c[key as keyof Choices] }))
                    }
                  >
                    <span />
                  </button>
                </div>
              );
            })}

            <div className="foot">
              <button className="btn line" onClick={() => commit(ALL_OFF)} disabled={pending}>
                Reject non-essential
              </button>
              <button className="btn dark" onClick={() => commit(choices)} disabled={pending}>
                Save preferences
              </button>
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 12, textAlign: 'center' }}>
              Full list of cookies, purposes, and durations in the{' '}
              <Link href="/legal/cookies">cookie policy</Link>.
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
