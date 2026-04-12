-- ============================================
-- SmartWood Supabase Setup
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable uuid extension
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password text not null,
  role text default 'customer',
  created_at timestamp with time zone default now()
);

-- Products table
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text,
  name_ar text,
  description text,
  description_ar text,
  price numeric,
  image_url text,
  category text,
  created_at timestamp with time zone default now()
);

-- Allow public read access to products (for anon key)
alter table products enable row level security;

create policy "Allow public read access on products"
  on products for select
  using (true);

create policy "Allow public insert on products"
  on products for insert
  with check (true);

create policy "Allow public update on products"
  on products for update
  using (true);

create policy "Allow public delete on products"
  on products for delete
  using (true);

-- Allow public access to users table (managed via API routes)
alter table users enable row level security;

create policy "Allow public read access on users"
  on users for select
  using (true);

create policy "Allow public insert on users"
  on users for insert
  with check (true);

create policy "Allow public update on users"
  on users for update
  using (true);

create policy "Allow public delete on users"
  on users for delete
  using (true);
