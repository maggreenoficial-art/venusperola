-- Meta Ads Management — contas e campanhas via System User Token
-- Execute no SQL Editor do Supabase

create table if not exists public.meta_ad_accounts (
  id text primary key,
  account_id text not null unique,
  name text not null,
  currency text,
  account_status integer,
  timezone_name text,
  amount_spent numeric(14,2) not null default 0,
  balance numeric(14,2) not null default 0,
  disable_reason text,
  is_selected boolean not null default false,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meta_ads_campaigns (
  id text primary key,
  ad_account_id text not null references public.meta_ad_accounts(account_id) on delete cascade,
  name text not null,
  status text not null default 'PAUSED',
  effective_status text,
  objective text,
  daily_budget numeric(14,2),
  lifetime_budget numeric(14,2),
  spend numeric(14,2) not null default 0,
  impressions integer not null default 0,
  clicks integer not null default 0,
  conversions numeric(10,2) not null default 0,
  cpa numeric(10,2),
  synced_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meta_ads_campaigns_account_idx
  on public.meta_ads_campaigns(ad_account_id);
create index if not exists meta_ads_campaigns_status_idx
  on public.meta_ads_campaigns(status);

alter table public.meta_ad_accounts enable row level security;
alter table public.meta_ads_campaigns enable row level security;
