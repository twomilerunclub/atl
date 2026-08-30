-- ============================================================================
-- Two Mile Run Club — core schema
-- ============================================================================
create extension if not exists "pgcrypto";

-- ---------- enums ----------
create type public.user_role       as enum ('runner', 'admin');
create type public.visibility      as enum ('public', 'members', 'private');
create type public.run_source      as enum ('manual', 'strava');
create type public.approval_status as enum ('pending', 'approved', 'rejected');
create type public.point_kind      as enum (
  'run', 'weekly_volume', 'performance', 'streak', 'referral', 'referral_bonus', 'badge'
);

-- ---------- profiles (1:1 with auth.users; never duplicates auth data) ----------
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text        not null,
  full_name       text        not null,
  avatar_url      text,
  auth_provider   text        not null default 'email',
  role            public.user_role not null default 'runner',
  birthday        date,
  experience      text,
  goal            text,
  typical_pace    text,
  visibility      public.visibility not null default 'members',
  marketing_optin boolean     not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint profiles_full_name_len check (char_length(full_name) between 1 and 120)
);
create index profiles_role_idx       on public.profiles (role);
create index profiles_visibility_idx on public.profiles (visibility);

-- ---------- private registration data (waiver, medical, emergency contact) ----------
create table public.member_details (
  user_id            uuid primary key references public.profiles(id) on delete cascade,
  phone              text,
  gender             text,
  street_address     text,
  city               text,
  region             text,
  postal_code        text,
  country            text,
  emergency_name     text,
  emergency_phone    text,
  medical_notes      text,
  heard_about        text,
  excited_about      text,
  prefers_weekdays   boolean not null default true,
  prefers_weekends   boolean not null default true,
  waiver_signature   text    not null,
  waiver_signed_at   timestamptz not null default now(),
  waiver_version     text    not null default '2026-08',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------- routes ----------
create table public.routes (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  distance_mi  numeric(4,2) not null check (distance_mi > 0),
  elevation_ft integer not null default 0,
  surface      text not null default 'Paved',
  description  text not null default '',
  path_svg     text not null default '',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create table public.route_likes (
  route_id  uuid not null references public.routes(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (route_id, user_id)
);
create index route_likes_route_idx on public.route_likes (route_id);

create table public.route_comments (
  id         uuid primary key default gen_random_uuid(),
  route_id   uuid not null references public.routes(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 1000),
  status     public.approval_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index route_comments_route_status_idx on public.route_comments (route_id, status);

create table public.route_suggestions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  distance    text not null,
  location    text,
  reason      text,
  status      public.approval_status not null default 'pending',
  created_at  timestamptz not null default now()
);

-- ---------- events + rsvps ----------
create table public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  starts_at   timestamptz not null,
  location    text not null,
  route_id    uuid references public.routes(id) on delete set null,
  luma_url    text,
  created_at  timestamptz not null default now()
);
create index events_starts_at_idx on public.events (starts_at);

create table public.event_rsvps (
  event_id   uuid not null references public.events(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- ---------- runs ----------
create table public.runs (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  ran_on            date not null,
  distance_mi       numeric(5,2) not null check (distance_mi > 0 and distance_mi <= 200),
  duration_seconds  integer not null check (duration_seconds > 0),
  route_id          uuid references public.routes(id) on delete set null,
  route_label       text,
  source            public.run_source not null default 'manual',
  strava_activity_id text,
  status            public.approval_status not null default 'pending',
  created_at        timestamptz not null default now(),
  unique (user_id, strava_activity_id)
);
create index runs_user_date_idx on public.runs (user_id, ran_on desc);
create index runs_status_idx    on public.runs (status) where status = 'pending';

-- ---------- points ledger ----------
create table public.point_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  kind       public.point_kind not null,
  points     integer not null,
  run_id     uuid references public.runs(id) on delete cascade,
  note       text,
  awarded_at timestamptz not null default now()
);
create index point_events_user_time_idx on public.point_events (user_id, awarded_at desc);

-- ---------- badges ----------
create table public.badges (
  slug        text primary key,
  name        text not null,
  description text not null,
  icon        text not null,
  points      integer not null,
  sort_order  integer not null default 0
);

create table public.user_badges (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  badge_slug text not null references public.badges(slug) on delete cascade,
  earned_at  timestamptz not null default now(),
  primary key (user_id, badge_slug)
);

-- ---------- referrals ----------
create table public.referrals (
  id             uuid primary key default gen_random_uuid(),
  referrer_id    uuid not null references public.profiles(id) on delete cascade,
  referred_id    uuid references public.profiles(id) on delete set null,
  referred_name  text,
  bonus_awarded  boolean not null default false,
  created_at     timestamptz not null default now()
);
create index referrals_referrer_idx on public.referrals (referrer_id);

-- ---------- blog ----------
create table public.posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  caption    text not null check (char_length(caption) between 1 and 2000),
  status     public.approval_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index posts_status_created_idx on public.posts (status, created_at desc);

create table public.post_photos (
  id       uuid primary key default gen_random_uuid(),
  post_id  uuid not null references public.posts(id) on delete cascade,
  path     text not null,
  position smallint not null check (position between 1 and 3),
  unique (post_id, position)
);

create table public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji   text not null check (char_length(emoji) <= 8),
  primary key (post_id, user_id, emoji)
);

create table public.post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index post_comments_post_idx on public.post_comments (post_id, created_at);

-- ---------- merch orders (written by the Stripe webhook only) ----------
create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references public.profiles(id) on delete set null,
  stripe_session_id text unique not null,
  email             text,
  amount_cents      integer not null check (amount_cents >= 0),
  currency          text not null default 'usd',
  status            text not null default 'paid',
  items             jsonb not null default '[]'::jsonb,
  created_at        timestamptz not null default now()
);
create index orders_user_idx on public.orders (user_id);

-- ---------- cookie consent ----------
create table public.cookie_consents (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  anon_id      text,
  necessary    boolean not null default true,
  functional   boolean not null default false,
  analytics    boolean not null default false,
  marketing    boolean not null default false,
  policy_version text not null default '2026-08',
  created_at   timestamptz not null default now(),
  constraint cookie_consents_subject check (user_id is not null or anon_id is not null)
);
create index cookie_consents_user_idx on public.cookie_consents (user_id, created_at desc);

-- ---------- updated_at trigger ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_touch       before update on public.profiles       for each row execute function public.touch_updated_at();
create trigger member_details_touch before update on public.member_details for each row execute function public.touch_updated_at();
