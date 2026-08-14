-- Hesabe payment integration — optional order columns.
-- Run once in the Supabase SQL editor. `status` already exists and is reused
-- ('pending' → 'paid' | 'failed'); these columns just store payment metadata.

alter table orders add column if not exists payment_id text;
alter table orders add column if not exists payment_method text;
