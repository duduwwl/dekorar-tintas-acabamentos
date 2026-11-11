-- Banco de dados da Dekorar Tintas (Supabase / Postgres)
-- Esquema completo: catálogo, estoque por loja, pedidos, itens e leads.
-- Rodar no SQL Editor do Supabase antes do seed.sql.

-- ---------- Tabelas ----------

create table if not exists public.stores (
  id   text primary key,          -- 'lavras', 'tres'
  name text not null,
  city text not null
);

create table if not exists public.products (
  id          text primary key,   -- slug, ex.: 'dkorar-premium'
  brand       text not null,
  name        text not null,
  category    text not null,
  price       numeric(10,2) not null default 0,  -- preço demonstrativo
  image       text,
  description text,
  package     text,
  indication  text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.inventory (
  product_id text not null references public.products(id) on delete cascade,
  store_id   text not null references public.stores(id) on delete cascade,
  quantity   integer not null default 0,
  minimum    integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (product_id, store_id)
);

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text unique,   -- ex.: 'DK204817'
  customer_name     text not null,
  customer_phone    text,
  customer_city     text,
  delivery          text,          -- 'Entrega Dekorar' | 'Retirada na Loja' | 'Correios'
  payment           text,          -- demonstrativo; nenhum dado de cartão é guardado
  total             numeric(10,2) not null default 0,
  status            text not null default 'Novo',
  shipping_carrier  text,
  shipping_tracking text,
  shipping_estimate date,
  shipping_notes    text,
  created_at        timestamptz not null default now()
);

create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   text references public.products(id) on delete set null,
  product_name text not null,      -- nome no momento do pedido (histórico)
  qty          integer not null default 1,
  unit_price   numeric(10,2) not null default 0,
  color_name   text,               -- sistema tintométrico
  color_hex    text
);

create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text,
  message    text,
  source     text not null default 'site',
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_brand    on public.products(brand);
create index if not exists idx_orders_status     on public.orders(status);
create index if not exists idx_orders_created     on public.orders(created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- ---------- Row Level Security ----------
-- Catálogo e estoque: leitura pública (chave anon). Escrita só autenticado (admin).
-- Pedidos e leads: o visitante pode criar (insert), mas só o admin lê.

alter table public.stores      enable row level security;
alter table public.products    enable row level security;
alter table public.inventory   enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.leads       enable row level security;

-- Leitura pública
create policy "stores_read"    on public.stores    for select using (true);
create policy "products_read"  on public.products  for select using (true);
create policy "inventory_read" on public.inventory for select using (true);

-- Escrita de catálogo/estoque só para autenticados
create policy "stores_write"    on public.stores    for all to authenticated using (true) with check (true);
create policy "products_write"  on public.products  for all to authenticated using (true) with check (true);
create policy "inventory_write" on public.inventory for all to authenticated using (true) with check (true);

-- Pedidos: visitante cria, admin lê e altera
create policy "orders_insert"      on public.orders      for insert to anon, authenticated with check (true);
create policy "orders_admin_read"  on public.orders      for select to authenticated using (true);
create policy "orders_admin_write" on public.orders      for update to authenticated using (true) with check (true);
create policy "order_items_insert" on public.order_items for insert to anon, authenticated with check (true);
create policy "order_items_read"   on public.order_items for select to authenticated using (true);

-- Leads: visitante cria, admin lê
create policy "leads_insert" on public.leads for insert to anon, authenticated with check (true);
create policy "leads_read"   on public.leads for select to authenticated using (true);
