# Dekorar Tintas & Acabamentos

Site institucional e catálogo da Dekorar (Lavras e Três Corações, MG), publicado no GitHub Pages:
https://duduwwl.github.io/dekorar-tintas-acabamentos/

## Páginas

- `index.html`: landing page em formato de catálogo de showroom: capa com a fachada, marca própria Dkorar e a linha completa, produtos por etapa, a loja por dentro (galeria), entrega e obras, marcas, ficha de pedido para o WhatsApp e endereços.
- `produtos.html`: catálogo com busca, filtros e carrinho demonstrativo (pedido enviado pelo WhatsApp).
- `gerencia.html`: área da equipe (estoque, pedidos e envios guardados no `localStorage` do navegador).

## Estrutura

```
assets/
  home.css / home.js     landing page (HTML, CSS e JS puros, sem build)
  styles.css / site.js   catálogo e área da equipe
  products.js / admin.js dados e lógica do catálogo e da gestão
  img/                   fotos reais da loja ampliadas 2x (Real-ESRGAN) em AVIF/WebP 640/1080/1800 px, embalagens recortadas (pack-*.webp), logo vetorizada e ícones
  fonts/                 Archivo (variável em peso e largura, OFL), hospedada localmente
  source/                originais: posts do Instagram, logo original e embalagens em PNG
```

Os tokens ficam no topo de `assets/home.css` e estão descritos em `DESIGN.md`. O contexto do produto está em `PRODUCT.md`.

## Executar localmente

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000`. Todos os caminhos são relativos, então o site funciona igual no subdiretório do GitHub Pages.
