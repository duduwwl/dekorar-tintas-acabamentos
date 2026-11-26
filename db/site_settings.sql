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

-- as políticas só valem depois do GRANT na tabela
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;

-- qualquer visitante lê (o site precisa dos textos e cores)
drop policy if exists site_settings_read on public.site_settings;
create policy site_settings_read on public.site_settings
  for select to anon, authenticated using (true);

-- só quem está logado na área da equipe grava
drop policy if exists site_settings_write on public.site_settings;
create policy site_settings_write on public.site_settings
  for update to authenticated using (true) with check (true);
