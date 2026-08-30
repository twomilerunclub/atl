-- ============================================================================
-- Row Level Security. Deny by default; every table gets explicit policies.
-- ============================================================================
alter table public.profiles          enable row level security;
alter table public.member_details    enable row level security;
alter table public.routes            enable row level security;
alter table public.route_likes       enable row level security;
alter table public.route_comments    enable row level security;
alter table public.route_suggestions enable row level security;
alter table public.events            enable row level security;
alter table public.event_rsvps       enable row level security;
alter table public.runs              enable row level security;
alter table public.point_events      enable row level security;
alter table public.badges            enable row level security;
alter table public.user_badges       enable row level security;
alter table public.referrals         enable row level security;
alter table public.posts             enable row level security;
alter table public.post_photos       enable row level security;
alter table public.post_reactions    enable row level security;
alter table public.post_comments     enable row level security;
alter table public.orders            enable row level security;
alter table public.cookie_consents   enable row level security;

-- ---------- profiles ----------
create policy "profiles: public profiles readable by anyone"
  on public.profiles for select
  using (
    visibility = 'public'
    or id = auth.uid()
    or (visibility = 'members' and auth.role() = 'authenticated')
    or public.is_admin()
  );

create policy "profiles: owner updates own row"
  on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Role changes are privileged: only an admin may write the role column.
create policy "profiles: admin updates any row"
  on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());

-- ---------- member_details (private: owner + admin only, never public) ----------
create policy "member_details: owner reads"   on public.member_details for select using (user_id = auth.uid() or public.is_admin());
create policy "member_details: owner writes"  on public.member_details for insert with check (user_id = auth.uid());
create policy "member_details: owner updates" on public.member_details for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- routes (guests may browse) ----------
create policy "routes: anyone reads active"  on public.routes for select using (is_active or public.is_admin());
create policy "routes: admin writes"         on public.routes for all    using (public.is_admin()) with check (public.is_admin());

create policy "route_likes: anyone reads"    on public.route_likes for select using (true);
create policy "route_likes: member likes"    on public.route_likes for insert with check (user_id = auth.uid());
create policy "route_likes: member unlikes"  on public.route_likes for delete using (user_id = auth.uid());

create policy "route_comments: approved visible, own always"
  on public.route_comments for select
  using (status = 'approved' or user_id = auth.uid() or public.is_admin());
create policy "route_comments: member submits"
  on public.route_comments for insert
  with check (user_id = auth.uid() and status = 'pending');
create policy "route_comments: admin moderates"
  on public.route_comments for update using (public.is_admin()) with check (public.is_admin());
create policy "route_comments: author or admin deletes"
  on public.route_comments for delete using (user_id = auth.uid() or public.is_admin());

create policy "route_suggestions: own or admin"   on public.route_suggestions for select using (user_id = auth.uid() or public.is_admin());
create policy "route_suggestions: member submits" on public.route_suggestions for insert with check (user_id = auth.uid());
create policy "route_suggestions: admin updates"  on public.route_suggestions for update using (public.is_admin()) with check (public.is_admin());

-- ---------- events ----------
create policy "events: anyone reads"  on public.events for select using (true);
create policy "events: admin writes"  on public.events for all using (public.is_admin()) with check (public.is_admin());

create policy "rsvps: anyone reads"   on public.event_rsvps for select using (true);
create policy "rsvps: member rsvps"   on public.event_rsvps for insert with check (user_id = auth.uid());
create policy "rsvps: member cancels" on public.event_rsvps for delete using (user_id = auth.uid());

-- ---------- runs (a member's own log is private to them and admins) ----------
create policy "runs: owner or admin reads" on public.runs for select using (user_id = auth.uid() or public.is_admin());
create policy "runs: owner logs pending"
  on public.runs for insert
  with check (user_id = auth.uid() and status = 'pending');
-- Owners may edit their own run details but cannot approve it: the status must
-- stay 'pending'. Approval is an admin-only transition.
create policy "runs: owner edits while pending"
  on public.runs for update
  using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid() and status = 'pending');
create policy "runs: admin approves" on public.runs for update using (public.is_admin()) with check (public.is_admin());
create policy "runs: owner or admin deletes" on public.runs for delete using (user_id = auth.uid() or public.is_admin());

-- ---------- points: readable (leaderboard is public), writable only by triggers ----------
create policy "point_events: anyone reads" on public.point_events for select using (true);
-- no insert/update/delete policies: only SECURITY DEFINER triggers may write.

-- ---------- badges ----------
create policy "badges: anyone reads"      on public.badges for select using (true);
create policy "badges: admin writes"      on public.badges for all using (public.is_admin()) with check (public.is_admin());
create policy "user_badges: anyone reads" on public.user_badges for select using (true);
create policy "user_badges: admin grants" on public.user_badges for insert with check (public.is_admin());

-- ---------- referrals ----------
create policy "referrals: own or admin reads" on public.referrals for select using (referrer_id = auth.uid() or public.is_admin());
create policy "referrals: member logs one"    on public.referrals for insert with check (referrer_id = auth.uid());

-- ---------- blog ----------
create policy "posts: approved visible to members, own always"
  on public.posts for select
  using ((status = 'approved' and auth.role() = 'authenticated') or user_id = auth.uid() or public.is_admin());
create policy "posts: member submits pending"
  on public.posts for insert with check (user_id = auth.uid() and status = 'pending');
create policy "posts: admin moderates" on public.posts for update using (public.is_admin()) with check (public.is_admin());
create policy "posts: author or admin deletes" on public.posts for delete using (user_id = auth.uid() or public.is_admin());

create policy "post_photos: follows post visibility"
  on public.post_photos for select
  using (exists (select 1 from public.posts p where p.id = post_id
                 and ((p.status = 'approved' and auth.role() = 'authenticated') or p.user_id = auth.uid() or public.is_admin())));
create policy "post_photos: author adds (max 3 enforced by unique position)"
  on public.post_photos for insert
  with check (exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid()));

create policy "reactions: members read"   on public.post_reactions for select using (auth.role() = 'authenticated');
create policy "reactions: own insert"     on public.post_reactions for insert with check (user_id = auth.uid());
create policy "reactions: own delete"     on public.post_reactions for delete using (user_id = auth.uid());

create policy "post_comments: members read" on public.post_comments for select using (auth.role() = 'authenticated');
create policy "post_comments: own insert"   on public.post_comments for insert with check (user_id = auth.uid());
create policy "post_comments: own or admin delete" on public.post_comments for delete using (user_id = auth.uid() or public.is_admin());

-- ---------- orders: buyer reads own; only the service role (webhook) writes ----------
create policy "orders: buyer or admin reads" on public.orders for select using (user_id = auth.uid() or public.is_admin());

-- ---------- cookie consent: a person may write their own record ----------
create policy "consents: own reads"  on public.cookie_consents for select using (user_id = auth.uid() or public.is_admin());
create policy "consents: anyone logs" on public.cookie_consents for insert with check (user_id is null or user_id = auth.uid());
