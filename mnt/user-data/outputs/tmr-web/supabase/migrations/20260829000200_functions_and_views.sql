-- ============================================================================
-- Helper functions, triggers, and the leaderboard view
-- ============================================================================

-- is_admin(): SECURITY DEFINER so RLS policies can call it without recursing
-- into the profiles policies. search_path pinned to defeat search-path attacks.
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.role = 'admin');
$$;
revoke execute on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

-- Create a profile row whenever a new auth user appears (email or OAuth).
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, auth_provider)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, 'runner'), '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(new.raw_app_meta_data ->> 'provider', 'email')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Points. The rules live here so the server can never be argued out of them by
-- a client: 10 per approved run, +15 for a 3-run week, +5..20 performance.
-- ----------------------------------------------------------------------------
create or replace function public.award_points_for_run()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  runs_that_week integer;
  perf_points    integer;
  pace_sec       numeric;
begin
  if new.status <> 'approved' or coalesce(old.status, 'pending') = 'approved' then
    return new;
  end if;

  insert into public.point_events (user_id, kind, points, run_id, note)
  values (new.user_id, 'run', 10, new.id, 'Approved run');

  -- performance: 5–20 points, faster pace earns more
  pace_sec := new.duration_seconds / nullif(new.distance_mi, 0);
  perf_points := greatest(5, least(20, round(20 - ((pace_sec - 420) / 60) * 3)::int));
  insert into public.point_events (user_id, kind, points, run_id, note)
  values (new.user_id, 'performance', perf_points, new.id, 'Performance');

  -- weekly volume bonus, awarded once when the third run of the week lands
  select count(*) into runs_that_week
  from public.runs r
  where r.user_id = new.user_id
    and r.status = 'approved'
    and date_trunc('week', r.ran_on) = date_trunc('week', new.ran_on);

  if runs_that_week = 3 then
    insert into public.point_events (user_id, kind, points, run_id, note)
    values (new.user_id, 'weekly_volume', 15, new.id, '3+ runs in a week');
  end if;

  return new;
end $$;

create trigger runs_award_points
  after update of status on public.runs
  for each row execute function public.award_points_for_run();

-- Referral: 25 on creation, +15 once the referred member has 3 approved runs.
create or replace function public.award_referral_points()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.point_events (user_id, kind, points, note)
  values (new.referrer_id, 'referral', 25, 'Referred a new member');
  return new;
end $$;

create trigger referrals_award_points
  after insert on public.referrals
  for each row execute function public.award_referral_points();

create or replace function public.settle_referral_bonus()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  r record;
  approved_runs integer;
begin
  if new.status <> 'approved' then return new; end if;

  select count(*) into approved_runs
  from public.runs where user_id = new.user_id and status = 'approved';

  if approved_runs >= 3 then
    for r in
      select * from public.referrals
      where referred_id = new.user_id and bonus_awarded = false
    loop
      insert into public.point_events (user_id, kind, points, note)
      values (r.referrer_id, 'referral_bonus', 15, 'Referral reached 3 runs');
      update public.referrals set bonus_awarded = true where id = r.id;
    end loop;
  end if;
  return new;
end $$;

create trigger runs_settle_referral
  after update of status on public.runs
  for each row execute function public.settle_referral_bonus();

-- Badges carry points too.
create or replace function public.award_badge_points()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare pts integer;
begin
  select points into pts from public.badges where slug = new.badge_slug;
  insert into public.point_events (user_id, kind, points, note)
  values (new.user_id, 'badge', coalesce(pts, 0), 'Badge: ' || new.badge_slug);
  return new;
end $$;

create trigger user_badges_award_points
  after insert on public.user_badges
  for each row execute function public.award_badge_points();

-- ----------------------------------------------------------------------------
-- Leaderboard: current calendar month, resets automatically.
-- ----------------------------------------------------------------------------
create or replace view public.leaderboard_monthly
with (security_invoker = on) as
select
  p.id            as user_id,
  p.full_name,
  p.avatar_url,
  coalesce(sum(pe.points), 0)::int as points,
  count(distinct r.id)::int        as runs,
  rank() over (order by coalesce(sum(pe.points), 0) desc, p.full_name) as rank
from public.profiles p
left join public.point_events pe
  on pe.user_id = p.id
 and pe.awarded_at >= date_trunc('month', now())
left join public.runs r
  on r.user_id = p.id
 and r.status = 'approved'
 and r.ran_on >= date_trunc('month', now())::date
group by p.id, p.full_name, p.avatar_url;

-- Weekly streak: consecutive weeks (ending this week or last) with a run.
create or replace function public.current_streak(uid uuid)
returns integer
language sql stable security definer set search_path = public
as $$
  with weeks as (
    select distinct date_trunc('week', ran_on)::date as wk
    from public.runs
    where user_id = uid and status = 'approved'
  ),
  ranked as (
    select wk, row_number() over (order by wk desc) as rn from weeks
  )
  select coalesce(count(*), 0)::int
  from ranked
  where wk = (date_trunc('week', now())::date - ((rn - 1) * interval '7 day'))::date
     or wk = (date_trunc('week', now())::date - interval '7 day' - ((rn - 1) * interval '7 day'))::date;
$$;
grant execute on function public.current_streak(uuid) to authenticated, anon;
