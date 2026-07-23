-- Fix admin completo (Supabase SQL Editor)
-- IMPORTANTE: para a SENHA, use o painel (mais confiável):
--   Authentication → Users → maggreenoficial@gmail.com → Send password recovery
--   OU clique no usuário e defina a senha na interface.
--
-- O SQL abaixo corrige perfil + identity. Só use o bloco de senha se o painel não funcionar.

-- 1) Diagnóstico
select
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role as profile_role,
  i.provider as identity_provider
from auth.users u
left join public.profiles p on p.id = u.id
left join auth.identities i on i.user_id = u.id and i.provider = 'email'
where u.email = 'maggreenoficial@gmail.com';

-- 2) Perfil admin ligado ao ID do Auth
insert into public.profiles (id, email, role)
select id, email, 'admin'
from auth.users
where email = 'maggreenoficial@gmail.com'
on conflict (id) do update
set role = 'admin', email = excluded.email, updated_at = now();

-- 3) Identity de e-mail (sem isso o login por senha pode falhar)
insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email',
  now(),
  now(),
  now()
from auth.users u
where u.email = 'maggreenoficial@gmail.com'
  and not exists (
    select 1 from auth.identities i
    where i.user_id = u.id and i.provider = 'email'
  );

-- 4) Confirma e-mail + tokens vazios (evita erro no GoTrue)
update auth.users
set
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change = coalesce(email_change, ''),
  updated_at = now()
where email = 'maggreenoficial@gmail.com';

-- 5) SENHA — rode este bloco (login: VenusAdmin2026!)
update auth.users
set
  encrypted_password = extensions.crypt('VenusAdmin2026!', extensions.gen_salt('bf', 10)),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change = coalesce(email_change, ''),
  updated_at = now()
where email = 'maggreenoficial@gmail.com';

-- 6) Conferir
select
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  i.provider
from auth.users u
join public.profiles p on p.id = u.id
left join auth.identities i on i.user_id = u.id and i.provider = 'email'
where u.email = 'maggreenoficial@gmail.com';
