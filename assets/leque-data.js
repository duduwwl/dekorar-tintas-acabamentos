/* Leque de cores Coral e Suvinil — cartela de REFERÊNCIA da Dekorar.
   Os tons são gerados por família (matiz, saturação e escala de claro a escuro), como as lâminas de um leque físico.
   Não são códigos oficiais dos fabricantes: a página avisa e a loja confere o código e a amostra antes de preparar.
   shortcut: tons gerados, não a cartela oficial; trocar por dados oficiais (nome, código, hex) quando a loja tiver o arquivo das marcas. */
(() => {
  'use strict';
  const FAMILIES = [
    // [nome, sigla, matiz, saturação, desvio de matiz entre lâminas, rampa de luminosidade]
    ['Brancos e gelos', 'BR', 45, 18, 70, [98, 96, 94, 92, 90, 88, 85]],
    ['Cinzas', 'CZ', 210, 6, 20, [90, 82, 72, 62, 50, 38, 26]],
    ['Beges e areias', 'BG', 36, 34, 8, [92, 86, 79, 71, 62, 52, 42]],
    ['Amarelos', 'AM', 48, 82, 6, [92, 85, 76, 66, 56, 46, 36]],
    ['Laranjas', 'LR', 24, 82, 6, [91, 83, 73, 63, 53, 44, 34]],
    ['Vermelhos', 'VM', 2, 66, 6, [90, 80, 68, 56, 46, 36, 26]],
    ['Rosas', 'RS', 340, 58, 8, [93, 86, 77, 67, 57, 46, 34]],
    ['Roxos e lilases', 'RX', 272, 40, 12, [92, 84, 74, 63, 51, 39, 27]],
    ['Azuis', 'AZ', 210, 56, 10, [93, 85, 75, 63, 50, 37, 24]],
    ['Verdes-água', 'VA', 172, 40, 8, [92, 84, 74, 63, 51, 39, 27]],
    ['Verdes', 'VD', 110, 34, 14, [91, 83, 72, 60, 48, 36, 25]],
    ['Terrosos e marrons', 'TR', 20, 38, 8, [86, 76, 65, 54, 43, 33, 23]]
  ];
  const BRAND = { Coral: { shift: 0, sat: 1 }, Suvinil: { shift: 5, sat: 0.92 } };

  const hex = (h, s, l) => {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  };

  const build = brand => {
    const b = BRAND[brand];
    return FAMILIES.map(([name, code, hue, sat, spread, ramp], fi) => ({
      name,
      code,
      blades: [-1, 0, 1].map((d, bi) => {
        const h = (hue + b.shift + d * spread + 360) % 360;
        return ramp.map((l, ti) => {
          // tons escuros perdem um pouco de saturação, como na tinta real
          const s = Math.max(2, sat * b.sat * (ti > 4 ? 0.85 : 1));
          return { name: `${name.split(' ')[0]} ${bi + 1}.${ti + 1}`, code: `${brand[0]}-${code}${fi + 1}${bi + 1}${ti + 1}`, hex: hex(h, s, l) };
        });
      })
    }));
  };
  window.LEQUE = { Coral: build('Coral'), Suvinil: build('Suvinil') };
})();
