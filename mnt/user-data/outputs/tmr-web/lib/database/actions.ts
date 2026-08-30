'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin, requireProfile } from '@/lib/auth/guards';
import { durationToSeconds } from '@/lib/format';
import {
  logRunSchema,
  postCommentSchema,
  postSchema,
  profileSchema,
  reactionSchema,
  routeCommentSchema,
  routeSuggestionSchema,
} from '@/lib/validation/schemas';
import type { ActionResult } from '@/types';

/**
 * Write-side. Each action: authenticate → validate → mutate under RLS →
 * revalidate. Nothing here trusts a client-supplied user id or status.
 */

export async function logRun(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = logRunSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: 'Check the run details', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createClient();

  // Resolve the label server-side rather than trusting a client-supplied string.
  let routeLabel: string | null = parsed.data.routeLabel || null;
  if (parsed.data.routeId) {
    const { data: route } = await supabase
      .from('routes')
      .select('name')
      .eq('id', parsed.data.routeId)
      .maybeSingle();
    routeLabel = route?.name ?? routeLabel;
  }

  const { error } = await supabase.from('runs').insert({
    user_id: profile.id,
    ran_on: parsed.data.ranOn,
    distance_mi: parsed.data.distanceMi,
    duration_seconds: durationToSeconds(parsed.data.duration),
    route_id: parsed.data.routeId || null,
    route_label: routeLabel,
    source: 'manual',
    status: 'pending', // clients can never self-approve
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/profile');
  return { ok: true, message: 'Run logged — sent for admin approval (+10 pts pending)' };
}

export async function toggleRsvp(eventId: string): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = createClient();

  const { data: existing } = await supabase
    .from('event_rsvps')
    .select('event_id')
    .eq('event_id', eventId)
    .eq('user_id', profile.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('event_rsvps').delete().eq('event_id', eventId).eq('user_id', profile.id);
    revalidatePath('/runs');
    return { ok: true, message: 'RSVP cancelled' };
  }

  const { error } = await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: profile.id });
  if (error) return { ok: false, error: error.message };

  revalidatePath('/runs');
  revalidatePath('/');
  return { ok: true, message: "You're in — see you there!" };
}

export async function toggleRouteLike(routeId: string): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = createClient();

  const { data: existing } = await supabase
    .from('route_likes')
    .select('route_id')
    .eq('route_id', routeId)
    .eq('user_id', profile.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('route_likes').delete().eq('route_id', routeId).eq('user_id', profile.id);
  } else {
    await supabase.from('route_likes').insert({ route_id: routeId, user_id: profile.id });
  }

  revalidatePath('/routes');
  return { ok: true };
}

export async function addRouteComment(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = routeCommentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Write a review first' };

  const supabase = createClient();
  const { error } = await supabase.from('route_comments').insert({
    route_id: parsed.data.routeId,
    user_id: profile.id,
    body: parsed.data.body,
    status: 'pending',
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath('/routes');
  return { ok: true, message: 'Review submitted — pending admin approval' };
}

export async function suggestRoute(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = routeSuggestionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: 'Add a route name and distance', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createClient();
  const { error } = await supabase.from('route_suggestions').insert({
    user_id: profile.id,
    name: parsed.data.name,
    distance: parsed.data.distance,
    location: parsed.data.location || null,
    reason: parsed.data.reason || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath('/routes');
  return { ok: true, message: `Route suggestion "${parsed.data.name}" sent to the admins 🎉` };
}

export async function createPost(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = postSchema.safeParse({
    caption: formData.get('caption'),
    photos: formData.getAll('photos').filter(Boolean),
  });
  if (!parsed.success) {
    return { ok: false, error: 'Write a caption first', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createClient();
  const { data: post, error } = await supabase
    .from('posts')
    .insert({ user_id: profile.id, caption: parsed.data.caption, status: 'pending' })
    .select('id')
    .single();
  if (error || !post) return { ok: false, error: error?.message ?? 'Could not save the post' };

  if (parsed.data.photos.length) {
    await supabase.from('post_photos').insert(
      parsed.data.photos.slice(0, 3).map((path, i) => ({ post_id: post.id, path, position: i + 1 }))
    );
  }

  revalidatePath('/blog');
  return { ok: true, message: 'Post submitted — an admin will review it shortly' };
}

export async function toggleReaction(formData: FormData): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = reactionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Invalid reaction' };

  const supabase = createClient();
  const { data: existing } = await supabase
    .from('post_reactions')
    .select('post_id')
    .eq('post_id', parsed.data.postId)
    .eq('user_id', profile.id)
    .eq('emoji', parsed.data.emoji)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('post_reactions')
      .delete()
      .eq('post_id', parsed.data.postId)
      .eq('user_id', profile.id)
      .eq('emoji', parsed.data.emoji);
  } else {
    await supabase.from('post_reactions').insert({
      post_id: parsed.data.postId,
      user_id: profile.id,
      emoji: parsed.data.emoji,
    });
  }

  revalidatePath('/blog');
  return { ok: true };
}

export async function addPostComment(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = postCommentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Write a comment first' };

  const supabase = createClient();
  const { error } = await supabase.from('post_comments').insert({
    post_id: parsed.data.postId,
    user_id: profile.id,
    body: parsed.data.body,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath('/blog');
  return { ok: true };
}

export async function updateProfile(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: 'Check the form', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createClient();
  // Note: role is intentionally absent. Only an admin policy can change it.
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.fullName,
      goal: parsed.data.goal || null,
      experience: parsed.data.experience || null,
      typical_pace: parsed.data.typicalPace || null,
      visibility: parsed.data.visibility,
    })
    .eq('id', profile.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/profile');
  return { ok: true, message: 'Profile updated' };
}

export async function logReferral(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const profile = await requireProfile();
  const name = String(formData.get('referredName') ?? '').trim();
  if (!name) return { ok: false, error: "Add the runner's name" };

  const supabase = createClient();
  const { error } = await supabase
    .from('referrals')
    .insert({ referrer_id: profile.id, referred_name: name.slice(0, 120) });
  if (error) return { ok: false, error: error.message };

  revalidatePath('/profile');
  revalidatePath('/leaderboard');
  return { ok: true, message: "Referral logged — +25 pts! We'll add +15 after their 3rd run." };
}

// ---------------------------------------------------------------- admin ----

export async function approveRun(runId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from('runs').update({ status: 'approved' }).eq('id', runId);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/leaderboard');
  return { ok: true, message: 'Run approved — points posted' };
}

export async function approveRouteComment(commentId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from('route_comments')
    .update({ status: 'approved' })
    .eq('id', commentId);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/routes');
  revalidatePath('/dashboard');
  return { ok: true, message: 'Review approved and published' };
}

export async function approvePost(postId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from('posts').update({ status: 'approved' }).eq('id', postId);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/blog');
  return { ok: true, message: 'Post is live' };
}

export async function promoteToAdmin(userId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard');
  return { ok: true, message: 'Member promoted to Admin' };
}
