-- Supabase Schema for AI Headshot Generator
-- Run this in your Supabase SQL editor to create the required tables

-- Users table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  credits integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Creations table
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

-- Uploads table
create table if not exists uploads (
  id uuid primary key default gen_random_uuid(),
  tenant_id text default 'default',
  file_url text,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (optional - adjust based on your needs)
-- Since auth is removed, you may want to disable RLS or set policies for public access
alter table users enable row level security;
alter table creations enable row level security;
alter table uploads enable row level security;

-- Create policies for public access (no auth)
create policy if not exists "Allow public read access on users"
  on users for select
  using (true);

create policy if not exists "Allow public insert on users"
  on users for insert
  using (true);

create policy if not exists "Allow public update on users"
  on users for update
  using (true);

create policy if not exists "Allow public read access on creations"
  on creations for select
  using (true);

create policy if not exists "Allow public insert on creations"
  on creations for insert
  using (true);

create policy if not exists "Allow public update on creations"
  on creations for update
  using (true);

create policy if not exists "Allow public insert on uploads"
  on uploads for insert
  using (true);