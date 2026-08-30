/**
 * Cookie registry. Every cookie the site can set is documented here, and this
 * same list renders the preference centre and the /legal/cookies page, so the
 * disclosure cannot drift from what is actually set.
 */

export type ConsentCategory = 'necessary' | 'functional' | 'analytics' | 'marketing';

export interface CookieEntry {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
  category: ConsentCategory;
}

export const CONSENT_VERSION = '2026-08';
export const CONSENT_COOKIE = 'tmr_consent';
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // 6 months, then re-ask

export const CATEGORY_COPY: Record<
  ConsentCategory,
  { title: string; description: string; alwaysOn: boolean }
> = {
  necessary: {
    title: 'Necessary',
    description:
      'Keeps you signed in and protects forms against cross-site request forgery. The site cannot work without these.',
    alwaysOn: true,
  },
  functional: {
    title: 'Functional',
    description:
      'Remembers preferences like your merch size and colour so you do not have to re-pick them.',
    alwaysOn: false,
  },
  analytics: {
    title: 'Analytics',
    description:
      'Anonymous counts of which pages runners visit, so we know which routes and events to feature.',
    alwaysOn: false,
  },
  marketing: {
    title: 'Marketing',
    description:
      'Measures whether a run event link brought someone to the site. Off unless you turn it on.',
    alwaysOn: false,
  },
};

export const COOKIE_REGISTRY: CookieEntry[] = [
  {
    name: 'sb-<project>-auth-token',
    provider: 'Supabase (first party)',
    purpose: 'Holds your signed-in session so protected pages stay open across refreshes.',
    duration: '1 hour, refreshed while active',
    category: 'necessary',
  },
  {
    name: 'tmr_consent',
    provider: 'Two Mile Run Club',
    purpose: 'Remembers the cookie choices you made here.',
    duration: '6 months',
    category: 'necessary',
  },
  {
    name: 'tmr_prefs',
    provider: 'Two Mile Run Club',
    purpose: 'Remembers your merch size and colour selection.',
    duration: '6 months',
    category: 'functional',
  },
  {
    name: '__stripe_mid / __stripe_sid',
    provider: 'Stripe',
    purpose: 'Fraud prevention during merch checkout. Set only once you begin a payment.',
    duration: '1 year / 30 minutes',
    category: 'necessary',
  },
  {
    name: '_tmr_analytics',
    provider: 'Two Mile Run Club',
    purpose: 'Aggregate page-view counts. Not loaded until analytics consent is given.',
    duration: '13 months',
    category: 'analytics',
  },
];

export interface ConsentState {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  version: string;
  decidedAt: string;
}

export const DENY_ALL: ConsentState = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  version: CONSENT_VERSION,
  decidedAt: '',
};

export function parseConsent(raw: string | undefined): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentState>;
    if (parsed.version !== CONSENT_VERSION) return null; // policy changed: ask again
    return {
      necessary: true,
      functional: Boolean(parsed.functional),
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      version: CONSENT_VERSION,
      decidedAt: parsed.decidedAt ?? '',
    };
  } catch {
    return null;
  }
}
