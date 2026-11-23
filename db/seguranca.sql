-- Segurança do banco da Dekorar (Supabase / Postgres).
-- Rodar no SQL Editor do Supabase DEPOIS de schema.sql e permissoes.sql. Pode rodar de novo.
--
-- O que este arquivo resolve:
--  1. Painel só para admins: antes, QUALQUER conta logada (inclusive uma criada por um estranho)
--     lia todos os pedidos e alterava o catálogo. Agora só e-mails da tabela public.admins.
--  2. Visitante só cria pedido "Novo": não escolhe status, rastreio, previsão nem data.
--  3. Limites de tamanho e de valor em todos os campos que o visitante preenche.
--  4. Limite de envios por IP (5 pedidos e 5 contatos a cada 10 minutos) e teto geral por hora,
--     contra robôs enchendo o banco.
--  5. Permissões por coluna: a chave pública do site só grava as colunas que o site usa.
--
-- Depois de rodar, cadastre o e-mail de quem usa o painel (troque pelo e-mail real):
--   insert into public.admins (email) values ('email-da-gerencia@exemplo.com');

begin;

-- ---------- 1. Admins ----------

create table if not exists public.admins (
  email text primary key check (email = lower(email))
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

-- Admin = usuário logado, com e-mail confirmado, cujo e-mail está em public.admins
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    join public.admins a on a.email = lower(u.email)
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- 2. Políticas (RLS) ----------

drop policy if exists "stores_write"    on public.stores;
drop policy if exists "products_write"  on public.products;
drop policy if exists "inventory_write" on public.inventory;
create policy "stores_write"    on public.stores    for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "products_write"  on public.products  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "inventory_write" on public.inventory for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_admin_read"  on public.orders;
drop policy if exists "orders_admin_write" on public.orders;
drop policy if exists "order_items_read"   on public.order_items;
drop policy if exists "leads_read"         on public.leads;
create policy "orders_admin_read"  on public.orders      for select to authenticated using (public.is_admin());
create policy "orders_admin_write" on public.orders      for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "order_items_read"   on public.order_items for select to authenticated using (public.is_admin());
create policy "leads_read"         on public.leads       for select to authenticated using (public.is_admin());

-- Pedido recém-criado (o visitante não lê a tabela de pedidos, então a checagem roda como dono)
create or replace function public.order_is_recent(oid uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.orders o where o.id = oid and o.created_at > now() - interval '15 minutes');
$$;
revoke all on function public.order_is_recent(uuid) from public;
grant execute on function public.order_is_recent(uuid) to anon, authenticated;

drop policy if exists "orders_insert"      on public.orders;
drop policy if exists "order_items_insert" on public.order_items;
drop policy if exists "leads_insert"       on public.leads;
create policy "orders_insert" on public.orders for insert to anon, authenticated with check (
  status = 'Novo'
  and shipping_tracking is null
  and shipping_estimate is null
  and created_at between now() - interval '5 minutes' and now() + interval '5 minutes'
);
create policy "order_items_insert" on public.order_items for insert to anon, authenticated with check (
  public.order_is_recent(order_id)
);
create policy "leads_insert" on public.leads for insert to anon, authenticated with check (
  handled = false
  and created_at between now() - interval '5 minutes' and now() + interval '5 minutes'
);

-- ---------- 3. Limites de tamanho e de valor ----------
-- "not valid": vale para tudo que entrar daqui em diante, sem travar por causa de dados antigos.

alter table public.orders drop constraint if exists orders_limites;
alter table public.orders add constraint orders_limites check (
  char_length(customer_name) between 2 and 80
  and char_length(coalesce(order_number, '')) <= 20
  and char_length(coalesce(customer_phone, '')) <= 20
  and char_length(coalesce(customer_city, '')) <= 60
  and char_length(coalesce(delivery, '')) <= 60
  and char_length(coalesce(payment, '')) <= 60
  and char_length(coalesce(shipping_carrier, '')) <= 40
  and char_length(coalesce(shipping_tracking, '')) <= 60
  and char_length(coalesce(shipping_notes, '')) <= 300
  and total between 0 and 100000
  and status in ('Novo', 'Separação', 'Pronto', 'Enviado', 'Entregue', 'Cancelado')
) not valid;

alter table public.order_items drop constraint if exists order_items_limites;
alter table public.order_items add constraint order_items_limites check (
  char_length(product_name) between 1 and 160
  and qty between 1 and 999
  and unit_price between 0 and 100000
  and char_length(coalesce(color_name, '')) <= 60
  and (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$')
) not valid;

alter table public.leads drop constraint if exists leads_limites;
alter table public.leads add constraint leads_limites check (
  char_length(name) between 1 and 80
  and char_length(coalesce(phone, '')) <= 20
  and char_length(coalesce(message, '')) <= 1000
  and char_length(source) <= 40
) not valid;

alter table public.products drop constraint if exists products_limites;
alter table public.products add constraint products_limites check (
  price between 0 and 100000
  and (image is null or image ~ '^assets/[A-Za-z0-9._/-]+$')
) not valid;

alter table public.inventory drop constraint if exists inventory_limites;
alter table public.inventory add constraint inventory_limites check (
  quantity between 0 and 1000000 and minimum between 0 and 1000000
) not valid;

-- ---------- 4. Limite de envios por IP ----------

create table if not exists public.rate_hits (
  key text not null,
  at  timestamptz not null default now()
);
create index if not exists idx_rate_hits on public.rate_hits (key, at desc);
alter table public.rate_hits enable row level security;   -- sem políticas: ninguém de fora lê nem grava
revoke all on public.rate_hits from anon, authenticated;

create or replace function public.limita_envios()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  hdr  json := nullif(current_setting('request.headers', true), '')::json;
  ip   text := coalesce(hdr ->> 'cf-connecting-ip', trim(split_part(coalesce(hdr ->> 'x-forwarded-for', ''), ',', 1)), '');
  tipo text := tg_argv[0];
  k    text := tipo || ':' || md5(ip);   -- guarda só o hash do IP
begin
  if public.is_admin() then return new; end if;
  delete from public.rate_hits where at < now() - interval '2 hours';
  if (select count(*) from public.rate_hits where key = k and at > now() - interval '10 minutes') >= 5 then
    raise exception 'Muitos envios seguidos. Tente de novo em alguns minutos.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.rate_hits where key like tipo || ':%' and at > now() - interval '1 hour') >= 300 then
    raise exception 'Recebemos muitos envios agora. Tente de novo mais tarde.' using errcode = 'P0001';
  end if;
  insert into public.rate_hits (key) values (k);
  return new;
end;
$$;
revoke all on function public.limita_envios() from public, anon, authenticated;

drop trigger if exists limita_pedidos on public.orders;
create trigger limita_pedidos before insert on public.orders for each row execute function public.limita_envios('pedido');
drop trigger if exists limita_leads on public.leads;
create trigger limita_leads before insert on public.leads for each row execute function public.limita_envios('lead');

-- No máximo 60 itens por pedido
create or replace function public.limita_itens()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.order_items where order_id = new.order_id) >= 60 then
    raise exception 'Pedido com itens demais.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function public.limita_itens() from public, anon, authenticated;
drop trigger if exists limita_itens on public.order_items;
create trigger limita_itens before insert on public.order_items for each row execute function public.limita_itens();

-- ---------- 5. Permissões por coluna ----------

revoke all on public.stores, public.products, public.inventory, public.orders, public.order_items, public.leads from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.stores, public.products, public.inventory to anon, authenticated;
grant insert, update, delete on public.stores, public.products, public.inventory to authenticated;

grant insert (id, order_number, customer_name, customer_phone, customer_city, delivery, payment, total, shipping_carrier, shipping_notes)
  on public.orders to anon, authenticated;
grant insert (order_id, product_id, product_name, qty, unit_price, color_name, color_hex)
  on public.order_items to anon, authenticated;
grant insert (name, phone, message, source) on public.leads to anon, authenticated;

grant select, update on public.orders to authenticated;
grant select on public.order_items, public.leads to authenticated;

commit;
