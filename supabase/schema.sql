-- Supabase Schema for AI Headshot Generator (no-auth, public access)
-- Supports both images and videos in creations table

-- Creations table
-- user_id: session ID from cookie
-- type: 'image' or 'video' (default 'image')
create table if not exists creations (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  type text default 'image',
  category text,
  aspect_ratio text,
  request_id text unique,
  status text default 'processing',
  image_url text[],
  video_url text[],
  thumbnail_url text,
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
alter table creations enable row level security;
alter table uploads enable row level security;

-- Public full access on creations
create policy "Allow public read access on creations"
  on creations for select
  using (true);

create policy "Allow public insert on creations"
  on creations for insert
  using (true);

create policy "Allow public update on creations"
  on creations for update
  using (true);

-- Public full access on uploads
create policy "Allow public insert on uploads"
  on uploads for insert
  using (true);

create policy "Allow public read access on uploads"
  on uploads for select
  using (true);
