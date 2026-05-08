-- Migration: newsletter_subscribers
-- Run once in Supabase SQL editor for the Amy's Haven project.
-- After this lands the POST /api/newsletter/subscribe endpoint will start persisting.

create table if not exists public.newsletter_subscribers (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    source text default 'site_footer',
    is_unsubscribed boolean default false,
    created_at timestamptz default now()
);

create index if not exists newsletter_subscribers_email_idx
    on public.newsletter_subscribers (email);

-- RLS: deny everything by default. The backend uses the service-role key
-- so RLS is bypassed there; no other client should read this table.
alter table public.newsletter_subscribers enable row level security;
