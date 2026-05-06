create extension if not exists citext;

create table if not exists public.game_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username citext not null,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_profiles_username_len check (char_length(username::text) between 3 and 24),
  constraint game_profiles_display_name_len check (char_length(display_name) between 1 and 40),
  constraint game_profiles_username_format check (username::text ~ '^[a-zA-Z0-9_]+$')
);

create unique index if not exists game_profiles_username_unique_idx
  on public.game_profiles (lower(username::text));

create table if not exists public.player_world_state (
  user_id uuid primary key references public.game_profiles(user_id) on delete cascade,
  map_id text not null default 'office_v1',
  position_x double precision not null default 0,
  position_y double precision not null default 1.6,
  position_z double precision not null default 2,
  rotation_yaw double precision not null default 0,
  rotation_pitch double precision not null default 0,
  fear_level double precision not null default 0,
  saved_reason text not null default 'autosave',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint player_world_state_map_id_len check (char_length(map_id) between 1 and 64),
  constraint player_world_state_saved_reason_len check (char_length(saved_reason) between 1 and 32)
);

create or replace function public.onlinegem_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'game_profiles_touch_updated_at'
  ) then
    create trigger game_profiles_touch_updated_at
    before update on public.game_profiles
    for each row execute function public.onlinegem_touch_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'player_world_state_touch_updated_at'
  ) then
    create trigger player_world_state_touch_updated_at
    before update on public.player_world_state
    for each row execute function public.onlinegem_touch_updated_at();
  end if;
end $$;

alter table public.game_profiles enable row level security;
alter table public.player_world_state enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'game_profiles'
      and policyname = 'Players can read profiles'
  ) then
    create policy "Players can read profiles"
      on public.game_profiles
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'game_profiles'
      and policyname = 'Players can insert own profile'
  ) then
    create policy "Players can insert own profile"
      on public.game_profiles
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'game_profiles'
      and policyname = 'Players can update own profile'
  ) then
    create policy "Players can update own profile"
      on public.game_profiles
      for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'player_world_state'
      and policyname = 'Players can read own world state'
  ) then
    create policy "Players can read own world state"
      on public.player_world_state
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'player_world_state'
      and policyname = 'Players can insert own world state'
  ) then
    create policy "Players can insert own world state"
      on public.player_world_state
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'player_world_state'
      and policyname = 'Players can update own world state'
  ) then
    create policy "Players can update own world state"
      on public.player_world_state
      for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

grant usage on schema public to authenticated;
grant select, insert, update on public.game_profiles to authenticated;
grant select, insert, update on public.player_world_state to authenticated;
