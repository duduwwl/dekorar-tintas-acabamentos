# Design — Dekorar

Mundo visual: catálogo impresso de showroom de acabamentos. Páginas duplas (foto sangrada de um lado, texto do outro), papel frio, tipografia larga e sóbria, laranja Dekorar como campo inteiro e na ação principal.

## Cores
| Papel | `#f2f2f0` | fundo geral |
| Branco | `#ffffff` | páginas de texto (entrega, ficha), placas de embalagem |
| Concreto | `#e2e1dd` | página "por etapa" e endereços |
| Grafite | `#1e1e1d` | texto e botão secundário |
| Grafite 2 | `#55534f` | texto de apoio (7:1 sobre papel) |
| Laranja Dekorar | `#e8561f` | campo da Dkorar e botão de WhatsApp (texto grafite) |
| Rodapé | `#262624` | rodapé |

## Tipo
Archivo variável, auto-hospedada. Títulos em largura 125% e peso 600–620, tracking -0.02em. Texto em largura 100%, 17px, entrelinha 1.55. Escala: display 38–84px, h2 30–52px, h3 20–24px, lead 17–20px, legenda 14px.

## Componentes
- Botão: retangular, raio 2px, 52px de altura; laranja com texto grafite ou grafite com texto papel; inversão no hover, `scale(.97)` ao pressionar.
- Link de texto: sublinhado 1px, vira laranja e 2px no hover.
- Fotos: cantos retos, sem sombra, legenda pequena abaixo ou sobre uma faixa escura só na base.
- Embalagens: recortadas em PNG/WebP com transparência, sobre placa branca.
- Sem ícones, bullets, selos, cards com sombra ou rótulos acima de títulos.

## Movimento e componentes
Biblioteca: Motion 12 (motion.dev), vendorizada em `assets/vendor/`. Componentes portados para JS puro:
- Motion Primitives: Text Effect (título da capa, palavra por palavra com blur), In View (entradas das seções), Animated Number (1.200 kg), Infinite Slider (faixa de marcas, pausa no hover), Magnetic (botão do WhatsApp), Animated Background (abas e filtros com fundo deslizante), Morphing Dialog (detalhes do produto com View Transitions), Scroll Progress, Text Scramble (código da cor no leitor).
- Fancy Components: Text Highlighter (frase da Dkorar), Underline Center (links), Element Along SVG Path (caminhonete na rota de entregas).
- Watermelon UI: Fluid Tabs, Copy Confirm (copiar endereço e código da cor), Pop Stepper (quantidades do orçamento), Scroll Island (pílula do orçamento).
- Canvas UI: Magnify (lupa do leitor de cor).
A foto da capa se revela da direita só no desktop. Tudo respeita `prefers-reduced-motion` e o conteúdo aparece mesmo sem JavaScript.

## Catálogo e área da equipe
`styles.css` usa os mesmos tokens em versão clara: fundo papel, superfícies brancas, texto grafite, laranja escurecido `#b13e12` para texto pequeno em laranja.
