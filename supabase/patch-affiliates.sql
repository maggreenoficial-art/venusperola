-- Sistema de Afiliados — Vênus Pérola
-- Execute no SQL Editor do Supabase

create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  unique_code text not null unique,
  name text not null,
  email text not null unique,
  cpf text,
  pix_key text not null,
  social_profile text,
  password_hash text not null,
  commission_percent numeric(5,2) not null default 15,
  tier text not null default 'iniciante',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'blocked')),
  balance_available numeric(12,2) not null default 0,
  total_paid numeric(12,2) not null default 0,
  clicks_count integer not null default 0,
  cancelled_sales_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists affiliates_code_idx on public.affiliates(unique_code);
create index if not exists affiliates_status_idx on public.affiliates(status);
create index if not exists affiliates_email_idx on public.affiliates(email);

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  ip_hash text not null,
  user_agent text,
  referer text,
  utm_source text,
  counted boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists affiliate_clicks_affiliate_idx
  on public.affiliate_clicks(affiliate_id);
create index if not exists affiliate_clicks_created_idx
  on public.affiliate_clicks(created_at desc);

create table if not exists public.affiliate_sales (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  order_id text not null unique references public.orders(id) on delete cascade,
  order_total numeric(12,2) not null,
  commission_percent numeric(5,2) not null,
  commission_gross numeric(12,2) not null,
  commission_net numeric(12,2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'cancelled', 'review')),
  fraud_flags text[] not null default '{}',
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index if not exists affiliate_sales_affiliate_idx
  on public.affiliate_sales(affiliate_id);
create index if not exists affiliate_sales_status_idx
  on public.affiliate_sales(status);

create table if not exists public.affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  amount numeric(12,2) not null,
  pix_key text not null,
  status text not null default 'sent'
    check (status in ('pending', 'sent', 'confirmed')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists affiliate_payouts_affiliate_idx
  on public.affiliate_payouts(affiliate_id);

alter table public.affiliates enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_sales enable row level security;
alter table public.affiliate_payouts enable row level security;
