# Dekorar Tintas & Acabamentos

Site institucional e catálogo da Dekorar (Lavras e Três Corações, MG), publicado no GitHub Pages:
https://duduwwl.github.io/dekorar-tintas-acabamentos/

## Páginas

- `index.html`: landing page: capa, marcas, clientes atendidos, Dkorar, obras prediais, residenciais e pintura industrial (WEG), loja online, tintométrico, empresas que confiam, entregas com mapa real (Google Maps) e rota animada, lojas e depoimentos.
- `leque-de-cores.html`: leque interativo Coral e Suvinil (cartela de referência em `assets/leque-data.js`) com escolha do produto e pedido pelo WhatsApp.
- `leitor-de-cor.html`: leitor de cor por foto.
- `orcamento.html`: ficha de orçamento para o WhatsApp.
- `tintometrico.html`: sistema tintométrico.
- `produtos.html`: catálogo com busca, filtros e carrinho demonstrativo (pedido enviado pelo WhatsApp).
- `gerencia.html`: área da equipe (estoque, pedidos e envios guardados no `localStorage` do navegador).

## Estrutura

```
assets/
  home.css / home.js     landing page (HTML, CSS e JS puros, sem build)
  catalog-data.js        lista de produtos usada pela landing e pelo catálogo
  vendor/                Motion 12 (motion.dev, licença MIT)
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
