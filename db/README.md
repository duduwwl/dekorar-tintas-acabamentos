# Banco de dados — Dekorar Tintas (Supabase)

Projeto Supabase `dekorar-site` (org MarketingOS AI). Esquema completo do site:
catálogo, estoque por loja, pedidos, itens de pedido e leads/orçamentos.

## Conexão (front público)

- **URL:** `https://nweqwzicallwafkkcauc.supabase.co`
- **Publishable key** (segura no navegador porque o RLS está ligado):
  `sb_publishable_i2zhF0Wc6qaqSaQy1fXEoA_pxOPMxOs`

A **secret key** e a **senha do Postgres** ficam em `db/.env.local`
(fora do Git). Nunca coloque essas duas no front.

## Tabelas

| Tabela        | Para quê                                             |
|---------------|------------------------------------------------------|
| `stores`      | As duas lojas (Lavras, Três Corações).               |
| `products`    | Catálogo (substitui o `catalog-data.js`).            |
| `inventory`   | Estoque por produto e por loja (quantidade, mínimo). |
| `orders`      | Pedidos da loja online.                              |
| `order_items` | Itens de cada pedido (com cor do tintométrico).      |
| `leads`       | Orçamentos/contatos vindos do site.                  |

## Regras de acesso (RLS, já aplicado)

- `products`, `stores`, `inventory`: **leitura pública**; escrita só autenticado (admin).
- `orders`, `order_items`, `leads`: o visitante pode **criar** (insert);
  **ler** só autenticado. O admin lê e altera depois de logar.

Preços são demonstrativos; nenhum dado de cartão é guardado (coerente com `shop.js`).

## Como aplicar de novo (projeto novo)

No **SQL Editor** do Supabase, rode nesta ordem:

1. `schema.sql` — tabelas, índices e políticas RLS.
2. `seed.sql` — lojas, 34 produtos, estoque e 5 pedidos de exemplo.

`seed.sql` é gerado de `assets/catalog-data.js` e `assets/admin.js` — não editar à mão.

## O site ainda não usa o banco

Catálogo, carrinho e admin seguem em `catalog-data.js` / `localStorage`.
Ligar o front ao Supabase (ler produtos do banco, gravar pedidos e leads) é o
próximo passo, quando você pedir.
