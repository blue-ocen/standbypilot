-- StandbyPilot production starter schema
-- Use this after creating a Supabase project.

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  trip_name text,
  traveler_name text,
  origin text,
  destination text,
  final_destination text,
  earliest_departure timestamptz,
  must_arrive_by timestamptz,
  return_date date,
  travelers int default 1,
  bags text,
  trip_type text,
  scope text,
  connections text,
  nearby_airports text,
  split_group text,
  backup_budget numeric,
  pass_system text,
  pass_priority text,
  priority text,
  open_seats int,
  standby_count int,
  cabin_notes text,
  load_notes text,
  notes text,
  risk_score int,
  risk_label text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.load_checks (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  flight_or_route text,
  open_seats int,
  standbys int,
  cabin_notes text,
  created_at timestamptz default now()
);

create table if not exists public.battle_cards (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  card_text text,
  card_html text,
  risk_score int,
  risk_label text,
  created_at timestamptz default now()
);

alter table public.trips enable row level security;
alter table public.load_checks enable row level security;
alter table public.battle_cards enable row level security;

create policy "Users can manage their trips"
  on public.trips
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their load checks"
  on public.load_checks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their battle cards"
  on public.battle_cards
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
