-- OUTBELLE / Vênus Pérola — Schema Supabase
-- Execute no SQL Editor do Supabase Dashboard
-- Seguro para rodar mais de uma vez (idempotente)

-- =============================================================================
-- PERFIS
-- =============================================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  pearls integer not null default 0,
  is_club_member boolean not null default false,
  club_joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists pearls integer not null default 0;
alter table public.profiles add column if not exists is_club_member boolean not null default false;
alter table public.profiles add column if not exists club_joined_at timestamptz;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- =============================================================================
-- PEDIDOS
-- =============================================================================
create table if not exists public.orders (
  id text primary key,
  user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending_payment',
  payment_method text not null,
  customer jsonb not null,
  shipping jsonb not null,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  shipping_cost numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  redeemed_pearls integer not null default 0,
  total numeric(10,2) not null,
  pearls_earned integer not null default 0,
  payment_reference text,
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists user_id uuid;
alter table public.orders add column if not exists shipping_cost numeric(10,2) not null default 0;
alter table public.orders add column if not exists discount numeric(10,2) not null default 0;
alter table public.orders add column if not exists redeemed_pearls integer not null default 0;
alter table public.orders add column if not exists pearls_earned integer not null default 0;
alter table public.orders add column if not exists payment_reference text;

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);

-- =============================================================================
-- ANALYTICS — corrige tabelas criadas em versões antigas sem coluna "type"
-- =============================================================================
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.analytics_events add column if not exists type text;
alter table public.analytics_events add column if not exists session_id text;
alter table public.analytics_events add column if not exists path text;
alter table public.analytics_events add column if not exists product_id text;
alter table public.analytics_events add column if not exists product_name text;
alter table public.analytics_events add column if not exists variant_id text;
alter table public.analytics_events add column if not exists value numeric(10,2);
alter table public.analytics_events add column if not exists order_id text;
alter table public.analytics_events add column if not exists source text default 'browser';
alter table public.analytics_events add column if not exists event_id text;
alter table public.analytics_events add column if not exists created_at timestamptz not null default now();

update public.analytics_events set type = 'page_view' where type is null;
update public.analytics_events set source = 'browser' where source is null;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'analytics_events'
      and column_name = 'type'
      and is_nullable = 'YES'
  ) then
    alter table public.analytics_events alter column type set default 'page_view';
    alter table public.analytics_events alter column type set not null;
  end if;
exception when others then null;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'analytics_events'
      and column_name = 'source'
      and is_nullable = 'YES'
  ) then
    alter table public.analytics_events alter column source set default 'browser';
    alter table public.analytics_events alter column source set not null;
  end if;
exception when others then null;
end $$;

create index if not exists analytics_events_type_idx on public.analytics_events(type);
create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at desc);

-- =============================================================================
-- META ADS + CONFIG
-- =============================================================================
create table if not exists public.meta_campaigns (
  id text primary key,
  name text not null,
  status text not null default 'active' check (status in ('active', 'paused')),
  spend numeric(10,2) not null default 0,
  impressions integer not null default 0,
  clicks integer not null default 0,
  conversions integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_config (key, value) values
  ('meta_ads', '{"targetRoas": 3}'),
  ('traffic_shield', '{"enabled":true,"mode":"protect","blockBots":true,"blockScrapers":true,"blockHeadless":true,"blockEmptyUa":true,"allowSearchEngines":true,"protectCampaigns":true,"hidePricingFromBots":true,"blockThreshold":75,"suspiciousThreshold":45,"safePagePath":"/bem-estar","allowedCountries":[],"blockedCountries":[],"ipWhitelist":[],"ipBlacklist":[],"mlSensitivity":0.7}')
on conflict (key) do nothing;

insert into public.meta_campaigns (id, name, status, spend, impressions, clicks, conversions) values
  ('camp-perola-secreta', 'Pérola Secreta — Conversão', 'active', 850, 42000, 1260, 18),
  ('camp-coelhinho', 'Coelhinho Luxo — Remarketing', 'active', 420, 18500, 740, 11),
  ('camp-topo-funil', 'Topo de Funil — Awareness', 'active', 600, 95000, 2100, 6),
  ('camp-mystery', 'Mystery Box — Lançamento', 'paused', 280, 12000, 380, 4)
on conflict (id) do nothing;

-- Contas e campanhas Meta (Marketing API / System User Token)
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

alter table public.meta_ad_accounts enable row level security;
alter table public.meta_ads_campaigns enable row level security;

-- =============================================================================
-- NEWSLETTER
-- =============================================================================
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'website',
  subscribed_at timestamptz not null default now()
);

-- =============================================================================
-- TRAFFIC SHIELD
-- =============================================================================
create table if not exists public.traffic_logs (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  user_agent text,
  path text not null,
  action text not null check (action in ('allow', 'suspicious', 'block', 'safe_page')),
  score integer not null default 0,
  reasons text[] not null default '{}',
  category text not null default 'human',
  country text,
  created_at timestamptz not null default now()
);

create index if not exists traffic_logs_created_at_idx on public.traffic_logs(created_at desc);
create index if not exists traffic_logs_action_idx on public.traffic_logs(action);
create index if not exists traffic_logs_category_idx on public.traffic_logs(category);

-- Domínios cadastrados para campanhas
create table if not exists public.traffic_domains (
  id uuid primary key default gen_random_uuid(),
  hostname text not null unique,
  label text,
  is_primary boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending', 'valid', 'invalid')),
  last_checked_at timestamptz,
  validation_message text,
  created_at timestamptz not null default now()
);

-- Campanhas de proteção de tráfego
create table if not exists public.traffic_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  domain_id uuid references public.traffic_domains(id) on delete set null,
  traffic_source text not null default 'meta',
  allowed_countries text[] not null default '{}',
  allowed_devices text[] not null default '{}',
  safe_page_url text not null,
  offer_page_url text not null,
  delivery_method text not null default 'redirect'
    check (delivery_method in ('redirect', 'pre_page', 'mirror', 'unpack')),
  offer_delivery_method text not null default 'redirect'
    check (offer_delivery_method in ('redirect', 'mirror', 'unpack')),
  unique_token_enabled boolean not null default true,
  unique_token text not null,
  custom_path_enabled boolean not null default false,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'paused')),
  clicks_offer integer not null default 0,
  clicks_safe integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists traffic_campaigns_slug_idx on public.traffic_campaigns(slug);
create index if not exists traffic_campaigns_status_idx on public.traffic_campaigns(status);

-- Cliques por campanha (tempo real)
create table if not exists public.traffic_campaign_clicks (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.traffic_campaigns(id) on delete cascade,
  destination text not null check (destination in ('offer', 'safe')),
  country text,
  device text,
  traffic_source text,
  ip_hash text not null,
  reasons text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists traffic_campaign_clicks_campaign_idx on public.traffic_campaign_clicks(campaign_id);
create index if not exists traffic_campaign_clicks_created_at_idx on public.traffic_campaign_clicks(created_at desc);

alter table public.traffic_domains enable row level security;
alter table public.traffic_campaigns enable row level security;
alter table public.traffic_campaign_clicks enable row level security;

-- =============================================================================
-- TRIGGER: perfil ao registrar
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- RLS
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.analytics_events enable row level security;
alter table public.meta_campaigns enable row level security;
alter table public.app_config enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.traffic_logs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (user_id = auth.uid());

drop policy if exists "orders_insert_authenticated" on public.orders;
create policy "orders_insert_authenticated" on public.orders
  for insert with check (user_id = auth.uid() or user_id is null);

drop policy if exists "analytics_insert" on public.analytics_events;
create policy "analytics_insert" on public.analytics_events
  for insert with check (true);

drop policy if exists "newsletter_insert" on public.newsletter_subscribers;
create policy "newsletter_insert" on public.newsletter_subscribers
  for insert with check (true);

-- Service role bypassa RLS automaticamente nas API routes server-side
