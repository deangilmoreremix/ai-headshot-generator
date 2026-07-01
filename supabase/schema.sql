-- Supabase Schema for AI Headshot Generator (no-auth, public access)
-- Supports both images and videos in creations table

-- Users table (kept for backwards compatibility; public access)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  credits integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Creations table
-- type column added: 'image' or 'video' (default 'image')
-- user_id is nullable text (so public no-auth users can still be tracked via session_id)
create table if not exists creations (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  type text default 'image',
  category text,
  aspect_ratio text,
  request_id text unique,
  status text default 'processing',
  image_url text,
  video_url text,
  error text,
  is_pack boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Uploads table (supports both images and videos via metadata)
create table if not exists uploads (
  id uuid primary key default gen_random_uuid(),
  tenant_id text default 'default',
  file_url text,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table users enable row level security;
alter table creations enable row level security;
alter table uploads enable row level security;

-- Public read on users
create policy if not exists "Allow public read access on users"
  on users for select
  using (true);

-- Public insert/update on users
create policy if not exists "Allow public insert on users"
  on users for insert
  using (true);

create policy if not exists "Allow public update on users"
  on users for update
  using (true);

-- Public full access on creations
create policy if not exists "Allow public read access on creations"
  on creations for select
  using (true);

create policy if not exists "Allow public insert on creations"
  on creations for insert
  using (true);

create policy if not exists "Allow public update on creations"
  on creations for update
  using (true);

-- Public full access on uploads
create policy if not exists "Allow public insert on uploads"
  on uploads for insert
  using (true);

create policy if not exists "Allow public read access on uploads"
  on uploads for select
  using (true);
