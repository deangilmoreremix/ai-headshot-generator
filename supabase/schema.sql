-- Supabase Schema for AI Headshot Generator
-- Anonymous only. Each browser gets an anonymous_id in localStorage.
-- The user provides their own muapi.ai key which is stored in profiles.muapi_key.

create table profiles (
  id uuid primary key default gen_random_uuid(),
  anonymous_id text unique,
  muapi_key text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists creations (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  category text not null,
  aspect_ratio text,
  request_id text unique,
  status text default 'processing',
  image_url text,
  error text,
  is_pack boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists uploads (
  id uuid primary key default gen_random_uuid(),
  file_url text,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

alter table profiles  enable row level security;
alter table creations enable row level security;
alter table uploads   enable row level security;

create policy if not exists "Allow public read on profiles"   on profiles   for select using (true);
create policy if not exists "Allow public insert on profiles"  on profiles   for insert with check (true);
create policy if not exists "Allow public update on profiles"  on profiles   for update using (true) with check (true);
create policy if not exists "Allow public read on creations"   on creations  for select using (true);
create policy if not exists "Allow public insert on creations"  on creations  for insert with check (true);
create policy if not exists "Allow public update on creations"  on creations  for update using (true) with check (true);
create policy if not exists "Allow public delete on creations"  on creations  for delete using (true);
create policy if not exists "Allow public read on uploads"      on uploads    for select using (true);
create policy if not exists "Allow public insert on uploads"    on uploads    for insert with check (true);

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables    in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

notify pgrst, 'reload schema';