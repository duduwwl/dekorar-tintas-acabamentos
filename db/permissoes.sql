-- Permissões das tabelas para as chaves do site (anon) e do painel (authenticated).
-- Projetos Supabase novos não liberam as tabelas sozinhos: sem isto o site recebe
-- "permission denied for table products". Rodar no SQL Editor depois do schema.sql.
-- O RLS (políticas do schema.sql) continua valendo por cima destas permissões.

grant usage on schema public to anon, authenticated;

-- Catálogo e estoque: leitura pública, escrita só do painel
grant select on public.stores, public.products, public.inventory to anon, authenticated;
grant insert, update, delete on public.stores, public.products, public.inventory to authenticated;

-- Pedidos e orçamentos: o visitante cria; o painel lê e atualiza
grant insert on public.orders, public.order_items, public.leads to anon, authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items, public.leads to authenticated;
