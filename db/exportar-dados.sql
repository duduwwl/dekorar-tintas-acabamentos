-- Exporta todos os dados do banco ATUAL como comandos INSERT, para levar a outro projeto
-- Supabase (ex.: a mudança dos EUA para São Paulo).
-- Rodar no SQL Editor do projeto ANTIGO. O resultado é uma única célula ("sql"):
-- copie o conteúdo dela e rode no projeto NOVO, depois do schema.sql.
-- Pode ser rodado de novo sem duplicar nada (tudo usa "on conflict do nothing").

with partes(ordem, texto) as (
  select 1, coalesce(string_agg(format(
    'insert into public.stores (id, name, city) values (%L, %L, %L) on conflict do nothing;',
    id, name, city), E'\n' order by id), '')
  from public.stores
  union all
  select 2, coalesce(string_agg(format(
    'insert into public.products (id, brand, name, category, price, image, description, package, indication, active, created_at) values (%L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L) on conflict do nothing;',
    id, brand, name, category, price, image, description, package, indication, active, created_at), E'\n' order by created_at, id), '')
  from public.products
  union all
  select 3, coalesce(string_agg(format(
    'insert into public.inventory (product_id, store_id, quantity, minimum, updated_at) values (%L, %L, %L, %L, %L) on conflict do nothing;',
    product_id, store_id, quantity, minimum, updated_at), E'\n' order by product_id, store_id), '')
  from public.inventory
  union all
  select 4, coalesce(string_agg(format(
    'insert into public.orders (id, order_number, customer_name, customer_phone, customer_city, delivery, payment, total, status, shipping_carrier, shipping_tracking, shipping_estimate, shipping_notes, created_at) values (%L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L) on conflict do nothing;',
    id, order_number, customer_name, customer_phone, customer_city, delivery, payment, total, status, shipping_carrier, shipping_tracking, shipping_estimate, shipping_notes, created_at), E'\n' order by created_at), '')
  from public.orders
  union all
  select 5, coalesce(string_agg(format(
    'insert into public.order_items (id, order_id, product_id, product_name, qty, unit_price, color_name, color_hex) values (%L, %L, %L, %L, %L, %L, %L, %L) on conflict do nothing;',
    id, order_id, product_id, product_name, qty, unit_price, color_name, color_hex), E'\n' order by order_id, id), '')
  from public.order_items
  union all
  select 6, coalesce(string_agg(format(
    'insert into public.leads (id, name, phone, message, source, handled, created_at) values (%L, %L, %L, %L, %L, %L, %L) on conflict do nothing;',
    id, name, phone, message, source, handled, created_at), E'\n' order by created_at), '')
  from public.leads
)
select 'begin;' || E'\n' || string_agg(texto, E'\n' order by ordem) || E'\n' || 'commit;' as sql
from partes;
