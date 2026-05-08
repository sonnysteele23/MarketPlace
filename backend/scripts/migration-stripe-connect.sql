-- Migration: Stripe Connect Express support
-- Run once in Supabase SQL editor for the Amy's Haven project.

-- Track Express account state on each artist. stripe_account_id already exists.
alter table public.artists
    add column if not exists stripe_charges_enabled boolean default false,
    add column if not exists stripe_payouts_enabled boolean default false,
    add column if not exists stripe_details_submitted boolean default false;

-- Track per-order fee splits in cents.
--   application_fee_amount: total platform take (10% platform + 5% donation = 15%)
--   donation_amount: 5% earmarked for homelessness solutions, paid out-of-band
alter table public.orders
    add column if not exists application_fee_amount integer,
    add column if not exists donation_amount integer,
    add column if not exists artist_id uuid references public.artists(id);

create index if not exists orders_artist_id_idx on public.orders (artist_id);
