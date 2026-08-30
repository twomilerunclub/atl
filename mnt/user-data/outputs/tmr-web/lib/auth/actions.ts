'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import {
  signInSchema,
  signUpSchema,
  resetRequestSchema,
  updatePasswordSchema,
  registrationSchema,
} from '@/lib/validation/schemas';
import type { ActionResult } from '@/types';

function origin() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? `https://${headers().get('host')}`;
}

function fail(error: string, fieldErrors?: Record<string, string[]>): ActionResult {
  return { ok: false, error, fieldErrors };
}

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail('Check the form', parsed.error.flatten().fieldErrors);

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // Deliberately generic: never reveal whether an address is registered.
  if (error) return fail('That email and password combination did not work.');

  revalidatePath('/', 'layout');
  redirect((formData.get('next') as string) || '/dashboard');
}

export async function signUp(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail('Check the form', parsed.error.flatten().fieldErrors);

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin()}/auth/confirm`,
      data: { full_name: parsed.data.fullName },
    },
  });
  if (error) return fail(error.message);

  return { ok: true, message: 'Check your email to verify your address, then sign in.' };
}

export async function signInWithGoogle(formData: FormData) {
  const supabase = createClient();
  const next = (formData.get('next') as string) || '/dashboard';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin()}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });

  if (error || !data.url) redirect('/auth/login?error=oauth');
  redirect(data.url);
}

export async function requestPasswordReset(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = resetRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail('Enter a valid email address');

  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin()}/auth/confirm?next=/auth/update-password`,
  });

  // Always the same reply, whether or not the address exists.
  return { ok: true, message: 'If that address has an account, a reset link is on its way.' };
}

export async function updatePassword(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = updatePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail('Check the form', parsed.error.flatten().fieldErrors);

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return fail(error.message);

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

/**
 * The five-step join flow. Creates the auth user, then stores the private
 * waiver/medical/emergency details in member_details (owner-readable only).
 */
export async function completeRegistration(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData);
  const parsed = registrationSchema.safeParse({
    ...raw,
    fitnessAck: raw.fitnessAck === 'on' || raw.fitnessAck === 'true',
    riskAck: raw.riskAck === 'on' || raw.riskAck === 'true',
    conductAck: raw.conductAck === 'on' || raw.conductAck === 'true',
    termsAck: raw.termsAck === 'on' || raw.termsAck === 'true',
    marketingOptin: raw.marketingOptin === 'on' || raw.marketingOptin === 'true',
    prefersWeekdays: raw.prefersWeekdays !== 'false',
    prefersWeekends: raw.prefersWeekends !== 'false',
  });
  if (!parsed.success) {
    return fail('Please finish the required fields', parsed.error.flatten().fieldErrors);
  }
  const d = parsed.data;

  const password = String(formData.get('password') ?? '');
  if (password.length < 8) return fail('Choose a password of at least 8 characters');

  const supabase = createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: d.email,
    password,
    options: {
      emailRedirectTo: `${origin()}/auth/confirm`,
      data: { full_name: d.fullName },
    },
  });
  if (signUpError) return fail(signUpError.message);

  const userId = signUpData.user?.id;
  if (userId) {
    await supabase
      .from('profiles')
      .update({
        birthday: d.birthday || null,
        experience: d.experience || null,
        goal: d.goal || null,
        typical_pace: d.typicalPace || null,
        marketing_optin: d.marketingOptin,
      })
      .eq('id', userId);

    await supabase.from('member_details').insert({
      user_id: userId,
      phone: d.phone || null,
      gender: d.gender || null,
      street_address: d.streetAddress || null,
      city: d.city || null,
      region: d.region || null,
      postal_code: d.postalCode || null,
      country: d.country || null,
      emergency_name: d.emergencyName || null,
      emergency_phone: d.emergencyPhone || null,
      medical_notes: d.medicalNotes || null,
      heard_about: d.heardAbout || null,
      excited_about: d.excitedAbout || null,
      prefers_weekdays: d.prefersWeekdays,
      prefers_weekends: d.prefersWeekends,
      waiver_signature: d.signature,
    });
  }

  return {
    ok: true,
    message: `Welcome to TMR, ${d.fullName.split(' ')[0]}! Check your email to verify your address.`,
  };
}
