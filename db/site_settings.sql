-- Textos e cores do site, editáveis na área da equipe (aba "Site").
-- Rodar uma vez no SQL Editor do Supabase.

create table if not exists public.site_settings (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values ('home')
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

-- qualquer visitante lê (o site precisa dos textos e cores)
drop policy if exists site_settings_read on public.site_settings;
create policy site_settings_read on public.site_settings
  for select to anon, authenticated using (true);

-- só quem está logado na área da equipe grava
drop policy if exists site_settings_write on public.site_settings;
create policy site_settings_write on public.site_settings
  for update to authenticated using (true) with check (true);
