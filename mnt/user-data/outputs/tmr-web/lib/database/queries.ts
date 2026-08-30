import 'server-only';

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type {
  EventWithRsvps,
  LeaderboardRow,
  PostWithMeta,
  RouteWithMeta,
  RunRecord,
} from '@/types';

/**
 * Read-side of the data layer. Every function runs under the caller's RLS
 * context — there is no privileged read path here by design.
 * react.cache() dedupes repeated calls within a single render pass.
 */

export const getLeaderboard = cache(async (): Promise<LeaderboardRow[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from('leaderboard_monthly')
    .select('*')
    .order('rank', { ascending: true })
    .limit(200);
  return (data as LeaderboardRow[]) ?? [];
});

export const getRoutes = cache(async (userId?: string): Promise<RouteWithMeta[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from('routes')
    .select(
      `id, slug, name, distance_mi, elevation_ft, surface, description, path_svg,
       route_likes ( user_id ),
       route_comments ( id, body, status, profiles ( full_name ) )`
    )
    .eq('is_active', true)
    .order('created_at');

  return (data ?? []).map((r: any) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    distance_mi: Number(r.distance_mi),
    elevation_ft: r.elevation_ft,
    surface: r.surface,
    description: r.description,
    path_svg: r.path_svg,
    likes: r.route_likes?.length ?? 0,
    likedByMe: Boolean(userId && r.route_likes?.some((l: any) => l.user_id === userId)),
    comments: (r.route_comments ?? [])
      .filter((c: any) => c.status === 'approved')
      .map((c: any) => ({ id: c.id, author: c.profiles?.full_name ?? 'TMR runner', body: c.body })),
  }));
});

export const getUpcomingEvents = cache(async (userId?: string): Promise<EventWithRsvps[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from('events')
    .select(
      `id, title, starts_at, location,
       routes ( name ),
       event_rsvps ( user_id, profiles ( full_name ) )`
    )
    .gte('starts_at', new Date().toISOString())
    .order('starts_at')
    .limit(12);

  return (data ?? []).map((e: any) => ({
    id: e.id,
    title: e.title,
    starts_at: e.starts_at,
    location: e.location,
    route_label: e.routes?.name ?? null,
    attendees: (e.event_rsvps ?? []).map((r: any) => ({
      id: r.user_id,
      name: r.profiles?.full_name ?? 'Runner',
    })),
    goingByMe: Boolean(userId && e.event_rsvps?.some((r: any) => r.user_id === userId)),
  }));
});

export const getMyRuns = cache(async (userId: string): Promise<RunRecord[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from('runs')
    .select('id, ran_on, distance_mi, duration_seconds, route_label, source, strava_activity_id, status')
    .eq('user_id', userId)
    .order('ran_on', { ascending: false })
    .limit(100);
  return ((data ?? []) as any[]).map((r) => ({ ...r, distance_mi: Number(r.distance_mi) }));
});

export const getMyStats = cache(async (userId: string) => {
  const runs = await getMyRuns(userId);
  const approved = runs.filter((r) => r.status === 'approved');
  const totalMiles = approved.reduce((a, r) => a + r.distance_mi, 0);
  const totalSeconds = approved.reduce((a, r) => a + r.duration_seconds, 0);

  const byWeek = new Map<string, number>();
  for (const r of approved) {
    const d = new Date(r.ran_on);
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    byWeek.set(key, (byWeek.get(key) ?? 0) + r.distance_mi);
  }
  const weeks = [...byWeek.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-8);

  const supabase = createClient();
  const { data: streak } = await supabase.rpc('current_streak', { uid: userId });

  return {
    totalMiles,
    avgWeeklyMiles: weeks.length ? weeks.reduce((a, [, m]) => a + m, 0) / weeks.length : 0,
    avgPaceSeconds: totalMiles ? totalSeconds / totalMiles : 0,
    streak: (streak as number) ?? 0,
    weeklyMiles: weeks.map(([, miles]) => Number(miles.toFixed(1))),
    runCount: approved.length,
  };
});

export const getMyBadges = cache(async (userId: string): Promise<string[]> => {
  const supabase = createClient();
  const { data } = await supabase.from('user_badges').select('badge_slug').eq('user_id', userId);
  return (data ?? []).map((b: any) => b.badge_slug);
});

export const getApprovedPosts = cache(async (userId?: string): Promise<PostWithMeta[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from('posts')
    .select(
      `id, caption, created_at, profiles ( full_name ),
       post_photos ( path, position ),
       post_reactions ( emoji, user_id ),
       post_comments ( id, body, profiles ( full_name ) )`
    )
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(30);

  return (data ?? []).map((p: any) => {
    const reactions: Record<string, number> = {};
    for (const r of p.post_reactions ?? []) reactions[r.emoji] = (reactions[r.emoji] ?? 0) + 1;
    return {
      id: p.id,
      author: p.profiles?.full_name ?? 'TMR runner',
      created_at: p.created_at,
      caption: p.caption,
      photos: (p.post_photos ?? [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((ph: any) => ph.path),
      reactions,
      myReactions: (p.post_reactions ?? [])
        .filter((r: any) => r.user_id === userId)
        .map((r: any) => r.emoji),
      comments: (p.post_comments ?? []).map((c: any) => ({
        id: c.id,
        author: c.profiles?.full_name ?? 'Runner',
        body: c.body,
      })),
    };
  });
});

/** Admin queues. RLS also enforces this — the guard is for clean redirects. */
export const getAdminQueues = cache(async () => {
  const supabase = createClient();
  const [runs, comments, posts, suggestions] = await Promise.all([
    supabase
      .from('runs')
      .select('id, ran_on, distance_mi, duration_seconds, profiles ( full_name )')
      .eq('status', 'pending')
      .order('created_at')
      .limit(50),
    supabase
      .from('route_comments')
      .select('id, body, routes ( name ), profiles ( full_name )')
      .eq('status', 'pending')
      .limit(50),
    supabase
      .from('posts')
      .select('id, caption, profiles ( full_name )')
      .eq('status', 'pending')
      .limit(50),
    supabase
      .from('route_suggestions')
      .select('id, name, distance, location, profiles ( full_name )')
      .eq('status', 'pending')
      .limit(50),
  ]);

  return {
    runs: (runs.data ?? []) as any[],
    comments: (comments.data ?? []) as any[],
    posts: (posts.data ?? []) as any[],
    suggestions: (suggestions.data ?? []) as any[],
  };
});

export const getClubStats = cache(async () => {
  const supabase = createClient();
  const [{ count: members }, { data: miles }] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('runs').select('distance_mi').eq('status', 'approved'),
  ]);
  const total = (miles ?? []).reduce((a: number, r: any) => a + Number(r.distance_mi), 0);
  return { members: members ?? 0, clubMiles: Math.round(total) };
});
