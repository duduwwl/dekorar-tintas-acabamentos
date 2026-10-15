# Dekorar Tintas & Acabamentos

Site institucional e catálogo responsivo da Dekorar, com:

- landing page com informações da loja, soluções, entrega e endereços;
- catálogo com busca, filtros, carrinho e checkout demonstrativo;
- área da equipe para gerenciar estoque, pedidos e envios no navegador;
- layouts validados para celular, tablet e desktop.

## Executar localmente

Sirva esta pasta com qualquer servidor HTTP estático. Exemplo:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Observação

Os dados do carrinho e da área de gestão são armazenados no `localStorage` do navegador. A confirmação do pedido é enviada à equipe via WhatsApp; nenhum pagamento é processado diretamente pelo site.
