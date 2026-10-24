# Dekorar Tintas & Acabamentos

Site institucional e catálogo da Dekorar (Lavras e Três Corações, MG), publicado no GitHub Pages:
https://duduwwl.github.io/dekorar-tintas-acabamentos/

## Páginas

- `index.html`: landing page (etapas da obra, montador de pedido via WhatsApp, a loja, galeria, entrega, marcas, endereços).
- `produtos.html`: catálogo com busca, filtros e carrinho demonstrativo (pedido enviado pelo WhatsApp).
- `gerencia.html`: área da equipe (estoque, pedidos e envios guardados no `localStorage` do navegador).

## Estrutura

```
assets/
  home.css / home.js     landing page (HTML, CSS e JS puros, sem build)
  styles.css / site.js   catálogo e área da equipe
  products.js / admin.js dados e lógica do catálogo e da gestão
  img/                   fotos reais da loja (AVIF + WebP em 640/960/1600 px), logo vetorizada e ícones
  fonts/                 Montserrat (variável, OFL), hospedada localmente
  source/                originais: posts do Instagram, logo original e embalagens em PNG
```

Os tokens de cor e tipo ficam no topo de `assets/home.css` (laranja `#e8561f`, preto `#151515`, branco `#f4f4f2`).

## Executar localmente

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000`. Todos os caminhos são relativos, então o site funciona igual no subdiretório do GitHub Pages.
