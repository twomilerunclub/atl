export type Role = 'runner' | 'admin';
export type Visibility = 'public' | 'members' | 'private';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type RunSource = 'manual' | 'strava';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  auth_provider: string;
  role: Role;
  birthday: string | null;
  experience: string | null;
  goal: string | null;
  typical_pace: string | null;
  visibility: Visibility;
  created_at: string;
}

export interface RunRecord {
  id: string;
  ran_on: string;
  distance_mi: number;
  duration_seconds: number;
  route_label: string | null;
  source: RunSource;
  strava_activity_id: string | null;
  status: ApprovalStatus;
}

export interface LeaderboardRow {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  points: number;
  runs: number;
  rank: number;
  streak?: number;
}

export interface RouteWithMeta {
  id: string;
  slug: string;
  name: string;
  distance_mi: number;
  elevation_ft: number;
  surface: string;
  description: string;
  path_svg: string;
  likes: number;
  likedByMe: boolean;
  comments: { id: string; author: string; body: string }[];
}

export interface EventWithRsvps {
  id: string;
  title: string;
  starts_at: string;
  location: string;
  route_label: string | null;
  attendees: { id: string; name: string }[];
  goingByMe: boolean;
}

export interface PostWithMeta {
  id: string;
  author: string;
  created_at: string;
  caption: string;
  photos: string[];
  reactions: Record<string, number>;
  myReactions: string[];
  comments: { id: string; author: string; body: string }[];
}

/** Result shape returned by every server action. */
export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
