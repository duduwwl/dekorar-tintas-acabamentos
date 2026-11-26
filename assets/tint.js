/* Dekorar — sistema tintométrico: marca → família → cor → base (produto) → quantidade.
   As cores vêm dos leques oficiais (leque-data.js): Coral e Suvinil, com código de cor.
   A fórmula final é conferida pela equipe na loja. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const PRODUCTS = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  const byId = new Map(PRODUCTS.map(p => [p.id, p]));
  const LEQUE = window.LEQUE || {};

  // Cada família é identificada por marca + nome, porque Coral e Suvinil têm nomes de família iguais.
  const FAMILIES = Object.entries(LEQUE).flatMap(([brand, fams]) => fams.map((f, i) => ({
    key: `${brand}:${i}`, brand, index: i, name: f.name,
    colors: f.blades.flat().map(([name, code, hex]) => ({ name, code, hex: `#${hex}` }))
  })));
  const ALL = FAMILIES.flatMap(f => f.colors.map(c => ({ ...c, family: f.name, familyKey: f.key, brand: f.brand })));
  // produtos que podem ser tingidos: tintas e esmaltes (as tintas Coral/Suvinil primeiro)
  const BASES = PRODUCTS.filter(p => ['Tintas', 'Esmaltes'].includes(p.category))
    .sort((a, b) => (a.brand === 'Dkorar' ? 1 : 0) - (b.brand === 'Dkorar' ? 1 : 0));

  const root = $('[data-tint]');
  const titleEl = $('[data-tint-title]'), leadEl = $('[data-tint-lead]');
  const dots = $$('[data-tint-dots] li');
  const panels = $$('[data-tint-step]');
  const BRANDS = Object.keys(LEQUE);
  const st = { step: 0, brand: BRANDS[0] || '', family: null, color: null, base: null, qty: 1 };
  const TEXTS = [
    ['Escolha a tonalidade desejada', 'Escolha o leque Coral ou Suvinil e selecione uma família de cores.'],
    ['Escolha a cor', 'Toque em uma cor para ver as bases em que ela pode ser preparada.'],
    ['Escolha a base do produto', 'Veja as tintas e esmaltes em que a cor escolhida pode ser feita.'],
    ['Confira e adicione ao carrinho', 'Ajuste a quantidade. A equipe confere a fórmula antes de preparar a tinta.']
  ];
  const lum = hex => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255; };
  const ink = hex => (lum(hex) > 0.58 ? '#1e1e1d' : '#ffffff');
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const famLabel = f => `${f.brand} · ${f.name}`;
  // as cores da Suvinil têm código próprio; na Coral o nome identifica a cor
  const codeText = c => (c.brand === 'Suvinil' && c.code ? ` · ${c.code}` : '');
  const famOf = key => FAMILIES.find(f => f.key === key) || null;

  function go(i, push = true) {
    st.step = i;
    panels.forEach((p, k) => { p.hidden = k !== i; });
    dots.forEach((d, k) => { d.classList.toggle('is-done', k < i); if (k === i) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
    titleEl.textContent = TEXTS[i][0]; leadEl.textContent = TEXTS[i][1];
    if (push) {
      const q = new URLSearchParams();
      if (st.brand) q.set('marca', st.brand);
      if (st.family && i >= 1) q.set('familia', String(famOf(st.family).index));
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

  /* 1. Leque (Coral ou Suvinil) e tonalidades: cards com as famílias do leque escolhido */
  const brandsEl = $('[data-tint-brands]');
  const brandCount = b => FAMILIES.filter(f => f.brand === b).reduce((n, f) => n + f.colors.length, 0);
  brandsEl.innerHTML = BRANDS.map(b => `<button type="button" class="tint-brand" data-brand="${esc(b)}"><strong translate="no">${esc(b)}</strong><small>${brandCount(b)} cores</small></button>`).join('');
  function renderFamilies() {
    $$('[data-brand]', brandsEl).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.brand === st.brand)));
    $('[data-tint-families]').innerHTML = FAMILIES.filter(f => f.brand === st.brand).map(f => {
      const picks = [0, Math.floor(f.colors.length / 2), f.colors.length - 1].map(k => f.colors[k].hex);
      return `<li><button class="tone-card" type="button" data-family="${esc(f.key)}">
        <span class="tone-swatch" aria-hidden="true">${picks.map(h => `<i style="background:${h}"></i>`).join('')}</span>
        <strong>${esc(f.name)}</strong><small>${esc(f.brand)} · ${f.colors.length} cores</small></button></li>`;
    }).join('');
  }
  brandsEl.addEventListener('click', e => {
    const b = e.target.closest('[data-brand]'); if (!b || b.dataset.brand === st.brand) return;
    st.brand = b.dataset.brand; st.family = null; st.color = null; st.base = null;
    renderFamilies(); go(0, false);
    history.replaceState(null, '', `?marca=${encodeURIComponent(st.brand)}`);
  });
  root.addEventListener('click', e => {
    const f = e.target.closest('[data-family]'); if (f) { st.family = f.dataset.family; $('[data-tint-search]').value = ''; go(1); return; }
    const c = e.target.closest('[data-color]'); if (c) { st.color = ALL.find(x => x.familyKey === c.dataset.cfamily && x.name === c.dataset.color) || null; if (st.color) go(2); return; }
    const b = e.target.closest('[data-base]'); if (b) { st.base = byId.get(b.dataset.base); st.qty = 1; go(3); return; }
    const back = e.target.closest('[data-back]'); if (back) go(Number(back.dataset.back));
  });

  /* 2. Cores: chips das famílias e lista de cores da família (ou busca em todas) */
  const chips = $('[data-tint-chips]');
  chips.innerHTML = FAMILIES.map(f => `<button type="button" class="tone-chip" data-chip="${esc(f.key)}" style="--c:${f.colors[Math.floor(f.colors.length / 2)].hex};--t:${ink(f.colors[Math.floor(f.colors.length / 2)].hex)}">${esc(famLabel(f))}</button>`).join('');
  chips.addEventListener('click', e => { const b = e.target.closest('[data-chip]'); if (!b) return; st.family = b.dataset.chip; $('[data-tint-search]').value = ''; renderColors(); go(1); });
  let qt; $('[data-tint-search]').addEventListener('input', () => { clearTimeout(qt); qt = setTimeout(renderColors, 100); });
  function renderColors() {
    const fam = famOf(st.family);
    $('[data-tint-family-name]').textContent = fam ? famLabel(fam) : 'Todas';
    // só as tonalidades e a busca do leque escolhido
    $$('[data-chip]', chips).forEach(b => { b.hidden = famOf(b.dataset.chip).brand !== st.brand; b.setAttribute('aria-pressed', String(b.dataset.chip === st.family)); });
    const q = norm($('[data-tint-search]').value.trim());
    const list = q ? ALL.filter(c => c.brand === st.brand && (norm(c.name).includes(q) || norm(c.code || '').includes(q))) : ALL.filter(c => c.familyKey === st.family);
    $('[data-tint-count]').textContent = `${list.length} ${list.length === 1 ? 'cor' : 'cores'}`;
    $('[data-tint-colors-title]').textContent = q ? 'Resultado da busca' : 'Cores da tonalidade';
    $('[data-tint-colors]').innerHTML = list.map(c => `<li><button class="color-card" type="button" data-color="${esc(c.name)}" data-cfamily="${esc(c.familyKey)}" style="--c:${c.hex};--t:${ink(c.hex)}"><span>${esc(c.name)}</span><small>${esc(c.brand)}${codeText(c)}${q ? ` · ${esc(c.family)}` : ''}</small></button></li>`).join('')
      || '<li class="tint-empty">Nenhuma cor com esse nome. Tente outra palavra.</li>';
  }

  /* 3. Bases */
  const colorBadge = c => `<span class="picked"><i style="background:${c.hex}"></i><span><small>Cor selecionada</small><strong>${esc(c.name)}</strong><em>${esc(c.brand)} · ${esc(c.family)}${codeText(c)} · ${c.hex.toUpperCase()}</em></span></span>`;
  // a base precisa ser da mesma marca da cor: a fórmula de cada leque é da marca
  const basesFor = c => BASES.filter(p => p.brand === c.brand);
  function renderBases() {
    $('[data-tint-picked]').innerHTML = colorBadge(st.color);
    const list = basesFor(st.color);
    $('[data-tint-bases]').innerHTML = list.length ? list.map(p => `<li><button class="base-card" type="button" data-base="${esc(p.id)}">
        <span class="base-media"><img src="${esc(p.image)}" alt="" loading="lazy" width="400" height="400"><i style="background:${st.color.hex}"></i></span>
        <span class="base-brand" translate="no">${esc(p.brand)}</span><strong>${esc(p.name)}</strong>
        <span class="base-foot"><span class="base-price">${money.format(p.price)}</span><span class="base-go">Escolher</span></span></button></li>`).join('')
      : '<li class="tint-empty">Esta cor não tem base disponível na loja online. Fale com a equipe pelo WhatsApp.</li>';
  }

  /* 4. Confirmação */
  function renderConfirm() {
    const p = st.base, c = st.color;
    $('[data-tint-confirm]').innerHTML = `
      <div class="confirm-media" style="--c:${c.hex}"><img src="${p.image}" alt="${esc(p.name)}" width="800" height="800"><span class="confirm-chip" style="background:${c.hex};color:${ink(c.hex)}">${esc(c.name)}</span></div>
      <div class="confirm-copy">
        <p class="confirm-brand" translate="no">${esc(p.brand)}</p>
        <h2 class="h3">${esc(p.name)}</h2>
        <p class="confirm-color">Cor <strong>${esc(c.name)}</strong> · ${esc(c.brand)} · ${esc(c.family)}${codeText(c)} · ${c.hex.toUpperCase()}</p>
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

  /* Início: aceita ?marca=&familia=&cor=&base= (familia é o índice dentro da marca) */
  const qs = new URLSearchParams(location.search);
  const brandQ = qs.get('marca') || '';
  const famQ = FAMILIES.find(f => norm(f.brand) === norm(brandQ) && String(f.index) === (qs.get('familia') || ''));
  const colQ = ALL.find(c => norm(c.name) === norm(qs.get('cor') || '') && (!brandQ || norm(c.brand) === norm(brandQ)));
  const base = byId.get(qs.get('base') || '');
  if (BRANDS.some(b => norm(b) === norm(brandQ))) st.brand = BRANDS.find(b => norm(b) === norm(brandQ));
  if (famQ) st.family = famQ.key;
  if (colQ) { st.color = colQ; st.family = colQ.familyKey; st.brand = colQ.brand; }
  renderFamilies();
  if (base && st.color && basesFor(st.color).includes(base)) st.base = base;
  go(st.base && st.color ? 3 : st.color ? 2 : st.family ? 1 : 0, false);
})();
