-- Reference data: badges and the three founding routes.
insert into public.badges (slug, name, description, icon, points, sort_order) values
  ('friend',  'Bring a Runner', 'Invite a friend who runs', '🤝', 10, 1),
  ('consist', 'Consistency',    '5 consistent runs',        '📆', 20, 2),
  ('tenk',    '10K Finisher',   'Run a 10K',                '⚡', 15, 3),
  ('tenmi',   'Double Digits',  'Run 10 miles',             '🏃', 30, 4),
  ('half',    'Half Marathon',  'Run 13.1 miles',           '🥈', 40, 5),
  ('full',    'Full Marathon',  'Run 26.2 miles',           '🏅', 50, 6)
on conflict (slug) do nothing;

insert into public.routes (slug, name, distance_mi, elevation_ft, surface, description, path_svg) values
  ('cent', 'Centennial Park Route', 2.0, 42, 'Paved',
   'Flat, fast, and lit at night. Loops the Olympic rings and fountain — the classic TMR first run.',
   'M20,140 C60,120 50,60 110,70 S200,140 260,90 S330,30 370,60'),
  ('benz', 'Mercedes-Benz Route', 2.1, 88, 'Paved',
   'Circles the stadium with one honest hill. Great crowd energy on game days.',
   'M20,60 C80,100 120,30 180,80 S260,140 320,80 S360,40 380,110'),
  ('krog', 'Krog Street Tunnel Route', 1.9, 55, 'Mixed',
   'Street-art tunnel out to the BeltLine and back. The most photographed route we run.',
   'M20,100 C70,40 140,140 200,70 S290,40 340,110 S370,130 385,80')
on conflict (slug) do nothing;
