-- ============================================================
-- SmartWood — one-shot DB fix. Run in Supabase → SQL Editor.
-- Safe to re-run (IF NOT EXISTS / ON CONFLICT everywhere).
-- Covers: wishlists, promo codes, order columns, order-item variants,
-- and Hesabe payment columns.
-- ============================================================

-- ---------- Wishlists ----------
create table if not exists wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);
alter table wishlists enable row level security;
drop policy if exists "public_all_wishlists" on wishlists;
create policy "public_all_wishlists" on wishlists
  for all using (true) with check (true);

-- ---------- Promo codes ----------
create table if not exists promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null default 'percent',  -- 'percent' | 'fixed'
  discount_value numeric not null,
  active boolean default true,
  created_at timestamptz default now()
);
alter table promo_codes enable row level security;
drop policy if exists "public_read_promo" on promo_codes;
create policy "public_read_promo" on promo_codes
  for select using (true);
insert into promo_codes (code, discount_type, discount_value, active) values
  ('WELCOME10', 'percent', 10, true),
  ('SAVE5',     'fixed',   5,  true)
on conflict (code) do nothing;

-- ---------- Orders: totals / promo / address ----------
alter table orders add column if not exists subtotal        numeric;
alter table orders add column if not exists discount_amount numeric default 0;
alter table orders add column if not exists promo_code      text;
alter table orders add column if not exists address_id      uuid;   -- no FK on purpose

-- ---------- Order items: chosen variant ----------
alter table order_items add column if not exists selected_color text;
alter table order_items add column if not exists selected_type  text;

-- ---------- Hesabe payment ----------
alter table orders add column if not exists payment_id     text;
alter table orders add column if not exists payment_method text;
