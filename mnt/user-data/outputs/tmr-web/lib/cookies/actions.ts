'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { consentSchema } from '@/lib/validation/schemas';
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE,
  CONSENT_VERSION,
  type ConsentState,
} from '@/lib/cookies/registry';

/**
 * Records a consent decision in a first-party cookie and, when someone is
 * signed in, keeps a dated audit row. No IP address or user agent is stored:
 * the record only needs to show what was chosen and when.
 */
export async function saveConsent(input: {
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}) {
  const parsed = consentSchema.safeParse({ necessary: true, ...input });
  if (!parsed.success) return { ok: false as const, error: 'Invalid consent payload' };

  const state: ConsentState = {
    necessary: true,
    functional: parsed.data.functional,
    analytics: parsed.data.analytics,
    marketing: parsed.data.marketing,
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
  };

  cookies().set(CONSENT_COOKIE, encodeURIComponent(JSON.stringify(state)), {
    maxAge: CONSENT_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false, // the client script reads it to decide what to load
  });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from('cookie_consents').insert({
    user_id: user?.id ?? null,
    anon_id: user ? null : crypto.randomUUID(),
    functional: state.functional,
    analytics: state.analytics,
    marketing: state.marketing,
    policy_version: CONSENT_VERSION,
  });

  return { ok: true as const, state };
}
