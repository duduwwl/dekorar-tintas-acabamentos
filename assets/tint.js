/* Dekorar — sistema tintométrico: tonalidade → cor → base (produto) → quantidade.
   Cartela ilustrativa: a fórmula final é conferida pela equipe na loja. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const PRODUCTS = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  const byId = new Map(PRODUCTS.map(p => [p.id, p]));

  const FAMILIES = window.TINT_FAMILIES;
  const ALL = FAMILIES.flatMap(f => f.colors.map(([name, hex]) => ({ name, hex, family: f.name })));
  // produtos que podem ser tingidos
  const BASES = PRODUCTS.filter(p => ['Tintas', 'Esmaltes'].includes(p.category) || (p.brand === 'Dkorar' && p.category === 'Texturas e efeitos'))
    .sort((a, b) => (a.brand === 'Dkorar' ? -1 : 0) - (b.brand === 'Dkorar' ? -1 : 0));

  const root = $('[data-tint]');
  const titleEl = $('[data-tint-title]'), leadEl = $('[data-tint-lead]');
  const dots = $$('[data-tint-dots] li');
  const panels = $$('[data-tint-step]');
  const st = { step: 0, family: null, color: null, base: null, qty: 1 };
  const TEXTS = [
    ['Escolha a tonalidade desejada', 'Selecione uma família de cores para encontrar a opção que você procura.'],
    ['Escolha a cor', 'Toque em uma cor para ver as bases em que ela pode ser preparada.'],
    ['Escolha a base do produto', 'Veja as tintas e texturas em que a cor escolhida pode ser feita.'],
    ['Confira e adicione ao carrinho', 'Ajuste a quantidade. A equipe confere a fórmula antes de preparar a tinta.']
  ];
  const lum = hex => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255; };
  const ink = hex => (lum(hex) > 0.58 ? '#1e1e1d' : '#ffffff');

  function go(i, push = true) {
    st.step = i;
    panels.forEach((p, k) => { p.hidden = k !== i; });
    dots.forEach((d, k) => { d.classList.toggle('is-done', k < i); if (k === i) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
    titleEl.textContent = TEXTS[i][0]; leadEl.textContent = TEXTS[i][1];
    if (push) {
      const q = new URLSearchParams();
      if (st.family && i >= 1) q.set('tonalidade', st.family);
      if (st.color && i >= 2) q.set('cor', st.color.name);
      if (st.base && i >= 3) q.set('base', st.base.id);
      history.replaceState(null, '', q.toString() ? `?${q}` : location.pathname);
    }
    if (i === 1) renderColors();
    if (i === 2) renderBases();
    if (i === 3) renderConfirm();
    if (push) root.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  dots.forEach((d, k) => d.addEventListener('click', () => { if (k < st.step) go(k); }));

  /* 1. Tonalidades */
  $('[data-tint-families]').innerHTML = FAMILIES.map(f => `<li><button class="tone-card" type="button" data-family="${esc(f.name)}">
      <span class="tone-swatch" aria-hidden="true">${f.colors.filter((_, i) => i % Math.ceil(f.colors.length / 3) === 0).slice(0, 3).map(([, h]) => `<i style="background:${h}"></i>`).join('')}</span>
      <strong>${esc(f.name)}</strong><small>${f.colors.length} cores · Explorar</small></button></li>`).join('');
  root.addEventListener('click', e => {
    const f = e.target.closest('[data-family]'); if (f) { st.family = f.dataset.family; $('[data-tint-search]').value = ''; go(1); return; }
    const c = e.target.closest('[data-color]'); if (c) { st.color = ALL.find(x => x.name === c.dataset.color); go(2); return; }
    const b = e.target.closest('[data-base]'); if (b) { st.base = byId.get(b.dataset.base); st.qty = 1; go(3); return; }
    const back = e.target.closest('[data-back]'); if (back) go(Number(back.dataset.back));
  });

  /* 2. Cores */
  const chips = $('[data-tint-chips]');
  chips.innerHTML = FAMILIES.map(f => `<button type="button" class="tone-chip" data-chip="${esc(f.name)}" style="--c:${f.colors[Math.floor(f.colors.length / 2)][1]};--t:${ink(f.colors[Math.floor(f.colors.length / 2)][1])}">${esc(f.name)}</button>`).join('');
  chips.addEventListener('click', e => { const b = e.target.closest('[data-chip]'); if (!b) return; st.family = b.dataset.chip; $('[data-tint-search]').value = ''; renderColors(); go(1); });
  let qt; $('[data-tint-search]').addEventListener('input', () => { clearTimeout(qt); qt = setTimeout(renderColors, 100); });
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function renderColors() {
    $('[data-tint-family-name]').textContent = st.family || 'Todas';
    $$('[data-chip]', chips).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.chip === st.family)));
    const q = norm($('[data-tint-search]').value.trim());
    const list = q ? ALL.filter(c => norm(c.name).includes(q)) : ALL.filter(c => c.family === st.family);
    $('[data-tint-count]').textContent = `${list.length} ${list.length === 1 ? 'cor' : 'cores'}`;
    $('[data-tint-colors-title]').textContent = q ? 'Resultado da busca' : 'Cores da tonalidade';
    $('[data-tint-colors]').innerHTML = list.map(c => `<li><button class="color-card" type="button" data-color="${esc(c.name)}" style="--c:${c.hex};--t:${ink(c.hex)}"><span>${esc(c.name)}</span><small>${c.hex.toUpperCase()}${q ? ` · ${esc(c.family)}` : ''}</small></button></li>`).join('')
      || '<li class="tint-empty">Nenhuma cor com esse nome. Tente outra palavra.</li>';
  }

  /* 3. Bases */
  const colorBadge = c => `<span class="picked"><i style="background:${c.hex}"></i><span><small>Cor selecionada</small><strong>${esc(c.name)}</strong><em>${esc(c.family)} · ${c.hex.toUpperCase()}</em></span></span>`;
  function renderBases() {
    $('[data-tint-picked]').innerHTML = colorBadge(st.color);
    $('[data-tint-bases]').innerHTML = BASES.map(p => `<li><button class="base-card" type="button" data-base="${p.id}">
        <span class="base-media"><img src="${p.image}" alt="" loading="lazy" width="400" height="400"><i style="background:${st.color.hex}"></i></span>
        <span class="base-brand" translate="no">${esc(p.brand)}</span><strong>${esc(p.name)}</strong>
        <span class="base-foot"><span class="base-price">${money.format(p.price)}</span><span class="base-go">Escolher</span></span></button></li>`).join('');
  }

  /* 4. Confirmação */
  function renderConfirm() {
    const p = st.base, c = st.color;
    $('[data-tint-confirm]').innerHTML = `
      <div class="confirm-media" style="--c:${c.hex}"><img src="${p.image}" alt="${esc(p.name)}" width="800" height="800"><span class="confirm-chip" style="background:${c.hex};color:${ink(c.hex)}">${esc(c.name)}</span></div>
      <div class="confirm-copy">
        <p class="confirm-brand" translate="no">${esc(p.brand)}</p>
        <h2 class="h3">${esc(p.name)}</h2>
        <p class="confirm-color">Cor <strong>${esc(c.name)}</strong> · ${esc(c.family)} · ${c.hex.toUpperCase()}</p>
        <p class="confirm-price">${money.format(p.price)}<small>preço demonstrativo, preparo da cor incluso</small></p>
        <dl class="pd-specs"><div><dt>Embalagem</dt><dd>${esc(p.package || 'Consulte as opções')}</dd></div><div><dt>Indicação</dt><dd>${esc(p.indication || '')}</dd></div></dl>
        <div class="pd-buy">
          <div class="stepper" role="group" aria-label="Quantidade"><button type="button" data-tq="-1" aria-label="Diminuir">−</button><output data-tqty>${st.qty}</output><button type="button" data-tq="1" aria-label="Aumentar">+</button></div>
          <button class="btn btn-orange" type="button" data-tint-add>Adicionar ao carrinho</button>
        </div>
        <p class="form-note">A cor da tela é uma referência. A equipe confere a fórmula e pode mostrar a amostra na loja.</p>
      </div>`;
  }
  $('[data-tint-confirm]').addEventListener('click', e => {
    const q = e.target.closest('[data-tq]');
    if (q) { st.qty = Math.max(1, Math.min(99, st.qty + Number(q.dataset.tq))); $('[data-tqty]').textContent = String(st.qty); return; }
    if (e.target.closest('[data-tint-add]') && window.DekorarCart) {
      const key = `${st.base.id}@${st.color.hex.slice(1).toUpperCase()}@${st.color.name}`;
      window.DekorarCart.add(key, st.qty);
      window.DekorarCart.open();
    }
  });

  /* Início: aceita ?tonalidade=&cor=&base= */
  const qs = new URLSearchParams(location.search);
  const fam = FAMILIES.find(f => norm(f.name) === norm(qs.get('tonalidade') || ''));
  const col = ALL.find(c => norm(c.name) === norm(qs.get('cor') || ''));
  const base = byId.get(qs.get('base') || '');
  if (fam) st.family = fam.name;
  if (col) { st.color = col; st.family = col.family; }
  if (base && BASES.includes(base)) st.base = base;
  go(st.base && st.color ? 3 : st.color ? 2 : st.family ? 1 : 0, false);
})();
