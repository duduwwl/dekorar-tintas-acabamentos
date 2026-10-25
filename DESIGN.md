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

## Movimento
Uma única sequência na abertura: a foto da capa se revela da direita (clip-path, 1.25s), o título sobe linha a linha e o resto aparece em fade. Fora isso, só resposta a ação (hover, pressão, galeria). Tudo some com `prefers-reduced-motion`.

## Catálogo e área da equipe
`styles.css` usa os mesmos tokens em versão clara: fundo papel, superfícies brancas, texto grafite, laranja escurecido `#b13e12` para texto pequeno em laranja.
