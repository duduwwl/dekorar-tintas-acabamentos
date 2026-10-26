/* Dekorar — loja online: catálogo com filtros, carrinho e checkout de demonstração.
   Nada de pagamento é processado: dados de cartão nunca são guardados nem enviados. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = 'https://wa.me/5535984336650';
  const PRODUCTS = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  const byId = new Map(PRODUCTS.map(p => [p.id, p]));
  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, f) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? f; } catch { return f; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } }
  };

  /* ---------- Cabeçalho e menu ---------- */
  const toggle = $('.menu-toggle'), menu = $('#menu');
  const setMenu = open => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.firstElementChild.textContent = open ? 'Fechar' : 'Menu';
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  window.matchMedia('(min-width: 1181px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
  $$('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });

  const toast = $('[data-toast]'); let tt;
  const showToast = msg => { toast.textContent = msg; toast.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('is-on'), 2800); };

  /* ---------- Filtros (só na página do catálogo) ---------- */
  let render = () => {};
  if ($('[data-grid]')) {
  /* ---------- Filtros ---------- */
  const CATS = [...new Set(PRODUCTS.map(p => p.category))];
  const BRANDS = ['Dkorar', 'Coral', 'Suvinil', 'Anjo', 'Ceramfix', 'Mactra'].filter(b => PRODUCTS.some(p => p.brand === b))
    .concat([...new Set(PRODUCTS.map(p => p.brand))].filter(b => !['Dkorar', 'Coral', 'Suvinil', 'Anjo', 'Ceramfix', 'Mactra'].includes(b)));
  const maxPrice = Math.ceil(Math.max(...PRODUCTS.map(p => p.price)) / 10) * 10;
  const params = new URLSearchParams(location.search);
  const state = { q: params.get('busca')?.trim() || '', cat: 'all', brands: new Set(), max: maxPrice, sort: 'relevance' };

  const catsEl = $('[data-cats]'), brandsEl = $('[data-brands]');
  catsEl.innerHTML = [['all', 'Todas', PRODUCTS.length], ...CATS.map(c => [c, c, PRODUCTS.filter(p => p.category === c).length])]
    .map(([v, l, n]) => `<button class="chip" type="button" data-cat="${esc(v)}" aria-pressed="${v === 'all'}">${esc(l)}<small>${n}</small></button>`).join('');
  brandsEl.innerHTML = BRANDS.map(b => `<label class="check"><input type="checkbox" value="${esc(b)}"> <span translate="no">${esc(b)}</span><small>${PRODUCTS.filter(p => p.brand === b).length}</small></label>`).join('');
  const range = $('[data-price]'), priceOut = $('[data-price-out]');
  range.max = String(maxPrice); range.value = String(maxPrice);
  const fmtMax = () => { priceOut.textContent = money.format(state.max).replace(',00', ''); };
  fmtMax();

  catsEl.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    state.cat = b.dataset.cat;
    $$('[data-cat]', catsEl).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    render();
  });
  brandsEl.addEventListener('change', e => { const v = e.target.value; e.target.checked ? state.brands.add(v) : state.brands.delete(v); render(); });
  range.addEventListener('input', () => { state.max = Number(range.value); fmtMax(); render(); });
  const catalogSearch = $('[data-search]');
  catalogSearch.value = state.q;
  let qt; catalogSearch.addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { state.q = e.target.value; render(); }, 120); });
  $('[data-sort]').addEventListener('change', e => { state.sort = e.target.value; render(); });
  $$('[data-clear]').forEach(b => b.addEventListener('click', () => {
    Object.assign(state, { q: '', cat: 'all', max: maxPrice, sort: 'relevance' }); state.brands.clear();
    catalogSearch.value = ''; $('[data-sort]').value = 'relevance'; range.value = String(maxPrice); fmtMax();
    $$('input', brandsEl).forEach(i => { i.checked = false; });
    $$('[data-cat]', catsEl).forEach(x => x.setAttribute('aria-pressed', String(x.dataset.cat === 'all')));
    render();
  }));
  const filtersEl = $('[data-filters]');
  $('[data-open-filters]').addEventListener('click', () => { filtersEl.classList.toggle('is-open'); });
  document.addEventListener('click', e => {
    if (filtersEl.classList.contains('is-open') && !e.target.closest('[data-filters]') && !e.target.closest('[data-open-filters]')) filtersEl.classList.remove('is-open');
  });

  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const grid = $('[data-grid]'), countEl = $('[data-count]'), emptyEl = $('[data-empty]');
  render = function () {
    const q = norm(state.q.trim());
    let list = PRODUCTS.filter(p => (state.cat === 'all' || p.category === state.cat)
      && (!state.brands.size || state.brands.has(p.brand))
      && p.price <= state.max
      && (!q || norm(`${p.id} ${p.name} ${p.brand} ${p.category} ${p.description} ${p.indication}`).includes(q)));
    if (state.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (state.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (state.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    countEl.textContent = list.length === 1 ? '1 produto' : `${list.length} produtos`;
    emptyEl.hidden = list.length > 0;
    grid.innerHTML = list.map((p, i) => `<li class="pcard" style="--i:${reduce ? 0 : Math.min(i, 12)}">
      <button class="pcard-media" type="button" data-open="${p.id}" tabindex="-1" aria-hidden="true"><img src="${p.image}" alt="" loading="${i < 6 ? 'eager' : 'lazy'}" decoding="async" width="400" height="400"></button>
      <div class="pcard-body">
        <p class="pcard-meta"><span class="b" translate="no">${esc(p.brand)}</span><span class="c">${esc(p.category)}</span></p>
        <h3><button type="button" data-open="${p.id}">${esc(p.name)}</button></h3>
        <p>${esc(p.description)}</p>
        <div class="pcard-foot"><p class="price">${money.format(p.price)}<small>ou 6x de ${money.format(p.price / 6)}</small></p>
          <button class="add-cart${cart[p.id] ? ' is-added' : ''}" type="button" data-add="${p.id}">${cart[p.id] ? 'No carrinho' : 'Adicionar'}</button></div>
      </div></li>`).join('');
  };
  }

  /* ---------- Carrinho ---------- */
  let cart = store.get('dekorar-cart', {});
  if (typeof cart !== 'object' || Array.isArray(cart)) cart = {};
  // chave do carrinho: "id" ou "id@HEX@Nome da cor" (itens do sistema tintométrico)
  const parseKey = k => { const [id, hex, name] = String(k).split('@'); return { id, color: hex ? { hex: `#${hex}`, name } : null }; };
  Object.keys(cart).forEach(k => { if (!byId.has(parseKey(k).id) || !(cart[k] > 0)) delete cart[k]; });
  const items = () => Object.entries(cart).map(([k, qty]) => {
    const { id, color } = parseKey(k); const base = byId.get(id);
    return { qty, color, p: color ? { ...base, id: k, name: `${base.name} · cor ${color.name}` } : base };
  });
  const subtotal = () => items().reduce((s, { p, qty }) => s + p.price * qty, 0);
  const badge = $('[data-cart-count]');
  const saveCart = () => {
    store.set('dekorar-cart', cart);
    const n = Object.values(cart).reduce((a, b) => a + b, 0);
    badge.textContent = String(n);
    if (!reduce) { badge.classList.remove('is-pop'); void badge.offsetWidth; badge.classList.add('is-pop'); }
    renderCart();
  };
  const add = (id, qty = 1) => {
    cart[id] = Math.min(99, (cart[id] || 0) + qty); saveCart();
    $$(`[data-add="${id}"]`).forEach(b => { b.classList.add('is-added'); b.textContent = 'No carrinho'; });
    const { id: baseId, color } = parseKey(id);
    showToast(`${byId.get(baseId).name}${color ? ` (${color.name})` : ''} no carrinho`);
  };
  window.DekorarCart = { add, open: () => { renderCart(); cartDlg.showModal(); } };
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]'); if (a) { add(a.dataset.add); return; }
    const o = e.target.closest('[data-open]'); if (o) openProduct(o.dataset.open);
  });

  const cartDlg = $('[data-cart]'), lines = $('[data-cart-lines]');
  function renderCart() {
    const list = items();
    lines.innerHTML = list.map(({ p, qty, color }) => `<li class="cart-line" data-id="${esc(p.id)}"><img src="${p.image}" alt="" loading="lazy">
      <div><strong>${color ? `<i class="cart-chip" style="background:${color.hex}"></i>` : ''}${esc(p.name)}</strong><div class="row">
        <div class="stepper" role="group" aria-label="Quantidade de ${esc(p.name)}"><button type="button" data-q="-1" aria-label="Diminuir">−</button><output>${qty}</output><button type="button" data-q="1" aria-label="Aumentar">+</button></div>
        <span class="price">${money.format(p.price * qty)}</span></div>
        <button class="remove" type="button" data-rm>Remover</button></div></li>`).join('');
    $('[data-cart-empty]').hidden = list.length > 0;
    $('[data-cart-foot]').hidden = list.length === 0;
    $('[data-cart-subtotal]').textContent = money.format(subtotal());
  }
  lines.addEventListener('click', e => {
    const li = e.target.closest('.cart-line'); if (!li) return; const id = li.dataset.id;
    if (e.target.closest('[data-rm]')) { delete cart[id]; saveCart(); render(); return; }
    const q = e.target.closest('[data-q]'); if (!q) return;
    cart[id] = Math.max(1, Math.min(99, cart[id] + Number(q.dataset.q))); saveCart();
  });
  $$('[data-open-cart]').forEach(b => b.addEventListener('click', () => { renderCart(); cartDlg.showModal(); }));

  /* ---------- Detalhe do produto ---------- */
  const pd = $('[data-product]'); let pdId = null, pdQty = 1;
  function openProduct(id) {
    const p = byId.get(id); if (!p) return; pdId = id; pdQty = 1;
    const img = $('[data-pd-img]', pd); img.src = p.image; img.alt = p.name;
    $('[data-pd-brand]', pd).textContent = p.brand;
    $('[data-pd-name]', pd).textContent = p.name;
    $('[data-pd-price]', pd).innerHTML = `${money.format(p.price)}<small>ou 6x de ${money.format(p.price / 6)} sem juros · preço demonstrativo</small>`;
    $('[data-pd-desc]', pd).textContent = p.description;
    $('[data-pd-cat]', pd).textContent = p.category;
    $('[data-pd-pack]', pd).textContent = p.package || 'Consulte as opções';
    $('[data-pd-use]', pd).textContent = p.indication || '';
    $('[data-pd-qty]', pd).textContent = '1';
    if (!pd.open) pd.showModal();
    history.replaceState(null, '', `?produto=${encodeURIComponent(id)}`);
  }
  pd.addEventListener('click', e => {
    const q = e.target.closest('[data-pd-q]');
    if (q) { pdQty = Math.max(1, Math.min(99, pdQty + Number(q.dataset.pdQ))); $('[data-pd-qty]', pd).textContent = String(pdQty); }
    if (e.target.closest('[data-pd-add]')) { add(pdId, pdQty); pd.close(); renderCart(); cartDlg.showModal(); }
  });
  pd.addEventListener('close', () => history.replaceState(null, '', location.pathname));

  // fechar diálogos: botão, clique fora
  $$('dialog').forEach(d => {
    d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  });

  /* ---------- Checkout ---------- */
  const co = $('[data-checkout]'), form = $('[data-co]'), err = $('[data-co-error]');
  const FEES = { Lavras: 15, 'Três Corações': 15, Varginha: 39.9, Outra: 59.9 };
  let step = 0;
  const panels = $$('[data-step-panel]', form), stepsEl = $$('[data-co-steps] li', co);
  const val = n => (form.elements[n]?.value || '').trim();
  const mode = () => form.elements.mode.value;
  const pay = () => form.elements.pay.value;
  const fee = () => (mode() === 'delivery' ? (FEES[val('city')] ?? 0) : 0);
  const discount = () => (pay() === 'pix' ? (subtotal() + fee()) * 0.05 : 0);
  const total = () => subtotal() + fee() - discount();

  // máscaras
  const masks = {
    cpf: v => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
    phone: v => { const d = v.replace(/\D/g, '').slice(0, 11); return d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3') : d.replace(/(\d{2})(\d{0,4})(\d{0,4})/, (m, a, b, c) => (b ? `(${a}) ${b}${c ? '-' + c : ''}` : a)); },
    cep: v => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'),
    card: v => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '),
    exp: v => v.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2')
  };
  $$('[data-mask]', form).forEach(i => i.addEventListener('input', () => { i.value = masks[i.dataset.mask](i.value); }));
  form.elements.cvv.addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });

  const cpfOk = c => {
    c = c.replace(/\D/g, ''); if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
    for (const t of [9, 10]) { let s = 0; for (let i = 0; i < t; i++) s += Number(c[i]) * (t + 1 - i); if (((s * 10) % 11) % 10 !== Number(c[t])) return false; }
    return true;
  };
  const luhn = n => { n = n.replace(/\D/g, ''); if (n.length < 13) return false; let s = 0; [...n].reverse().forEach((d, i) => { let x = Number(d); if (i % 2) { x *= 2; if (x > 9) x -= 9; } s += x; }); return s % 10 === 0; };

  // CEP: preenche o endereço (ViaCEP), quando disponível
  form.elements.cep.addEventListener('input', async e => {
    const d = e.target.value.replace(/\D/g, ''); if (d.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`); const j = await r.json(); if (j.erro) return;
      if (j.logradouro && !val('street')) form.elements.street.value = j.logradouro;
      if (j.bairro && !val('district')) form.elements.district.value = j.bairro;
      const c = ['Lavras', 'Três Corações', 'Varginha'].includes(j.localidade) ? j.localidade : 'Outra';
      form.elements.city.value = c; sync();
      form.elements.number.focus();
    } catch { /* sem conexão: preenchimento manual */ }
  });

  function syncPayUI() {
    const p = pay();
    $$('[data-pay]', form).forEach(el => { el.hidden = !(el.dataset.pay === p || (el.dataset.pay === 'card' && (p === 'credit' || p === 'debit'))); });
    $('[data-installments]', form).hidden = p !== 'credit';
    const sel = $('[data-inst]', form), t = subtotal() + fee(), cur = sel.value || '1';
    sel.innerHTML = [1, 2, 3, 4, 5, 6].map(n => `<option value="${n}">${n}x de ${money.format(t / n)} sem juros</option>`).join('');
    sel.value = cur;
  }
  function sync() {
    const delivery = mode() === 'delivery';
    $('[data-pickup]', form).hidden = delivery;
    $('[data-delivery]', form).hidden = !delivery;
    const city = val('city');
    $('[data-fee-note]', form).textContent = !city ? 'Escolha a cidade para ver a taxa de entrega.'
      : city === 'Outra' ? `Taxa estimada de ${money.format(FEES.Outra)} (demonstrativa). A equipe confirma se a entrega chega na sua cidade.`
      : `Taxa de entrega para ${city}: ${money.format(FEES[city])} (demonstrativa).`;
    syncPayUI(); summary();
  }
  function summary() {
    $('[data-sum-items]', co).innerHTML = items().map(({ p, qty }) => `<li><img src="${p.image}" alt=""><span>${qty}× ${esc(p.name)}</span><span>${money.format(p.price * qty)}</span></li>`).join('');
    $('[data-sum-sub]', co).textContent = money.format(subtotal());
    $('[data-sum-fee]', co).textContent = mode() === 'delivery' ? (val('city') ? money.format(fee()) : 'Escolha a cidade') : 'Grátis (retirada)';
    $('[data-sum-disc-row]', co).hidden = !discount();
    $('[data-sum-disc]', co).textContent = `− ${money.format(discount())}`;
    $('[data-sum-total]', co).textContent = money.format(total());
    const n = Number(form.elements.inst.value || 1);
    $('[data-sum-inst]', co).textContent = pay() === 'credit' && n > 1 ? `${n}x de ${money.format(total() / n)} no cartão (demonstrativo)` : 'Valores demonstrativos.';
  }
  form.addEventListener('change', e => { if (e.target.name !== 'inst') sync(); else summary(); });

  function check(i) {
    const bad = [];
    const mark = (name, ok) => { const el = form.elements[name]; el.setAttribute('aria-invalid', String(!ok)); if (!ok) bad.push(el); };
    if (i === 0) {
      mark('name', val('name').split(/\s+/).length >= 2);
      mark('cpf', cpfOk(val('cpf')));
      mark('phone', val('phone').replace(/\D/g, '').length >= 10);
      mark('email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email')));
      if (bad.length) return [bad, 'Confira os campos destacados: nome e sobrenome, CPF válido, celular com DDD e e-mail.'];
    }
    if (i === 1 && mode() === 'delivery') {
      mark('cep', val('cep').replace(/\D/g, '').length === 8);
      ['city', 'street', 'number', 'district'].forEach(n => mark(n, !!val(n)));
      if (bad.length) return [bad, 'Preencha o endereço de entrega: CEP, cidade, rua, número e bairro.'];
    }
    if (i === 2 && (pay() === 'credit' || pay() === 'debit')) {
      mark('cc', luhn(val('cc')));
      mark('ccname', val('ccname').length >= 3);
      const [mm, yy] = val('ccexp').split('/').map(Number); const now = new Date();
      mark('ccexp', mm >= 1 && mm <= 12 && yy >= 0 && (2000 + yy > now.getFullYear() || (2000 + yy === now.getFullYear() && mm >= now.getMonth() + 1)));
      mark('cvv', /^\d{3,4}$/.test(val('cvv')));
      if (bad.length) return [bad, 'Confira os dados do cartão. Para testar, use um número de teste como 4111 1111 1111 1111.'];
    }
    if (i === 3 && !form.elements.ok.checked) return [[form.elements.ok], 'Marque a confirmação para continuar.'];
    return null;
  }
  const payLabel = () => ({ pix: 'Pix (5% de desconto)', credit: `Cartão de crédito em ${form.elements.inst.value || 1}x`, debit: 'Cartão de débito', boleto: 'Boleto', onsite: 'Pagar ao receber' }[pay()]);
  const recvLabel = () => (mode() === 'pickup' ? `Retirada na loja de ${form.elements.store.value}` : `Entrega em ${val('street')}, ${val('number')}${val('complement') ? ' ' + val('complement') : ''}, ${val('district')}, ${val('city') === 'Outra' ? 'outra cidade' : val('city')} · CEP ${val('cep')}`);
  function review() {
    const card = (pay() === 'credit' || pay() === 'debit') ? ` · final ${val('cc').replace(/\D/g, '').slice(-4)}` : '';
    $('[data-review]', form).innerHTML = [
      ['Cliente', `${esc(val('name'))} · CPF ${esc(val('cpf'))}<br>${esc(val('phone'))} · ${esc(val('email'))}`, 0],
      ['Recebimento', esc(recvLabel()), 1],
      ['Pagamento', esc(payLabel() + card), 2],
      ['Total', `${money.format(total())} (demonstrativo)`, null]
    ].map(([k, v, s]) => `<div><dt>${k}</dt><dd>${v}</dd>${s === null ? '<span></span>' : `<button type="button" data-goto="${s}">Alterar</button>`}</div>`).join('');
  }
  function go(i) {
    step = i; err.textContent = '';
    panels.forEach((p, k) => { p.hidden = k !== i; });
    stepsEl.forEach((li, k) => { li.classList.toggle('is-done', k < i); if (k === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
    $('[data-co-back]', form).hidden = i === 0;
    $('[data-co-next]', form).hidden = i === 3;
    $('[data-co-submit]', form).hidden = i !== 3;
    if (i === 3) review();
    sync();
    $('.co-main', form).scrollIntoView({ block: 'start' });
    co.scrollTop = 0;
    panels[i].querySelector('input:not([type=radio]), select, button')?.focus({ preventScroll: true });
  }
  $('[data-co-next]', form).addEventListener('click', () => {
    const bad = check(step);
    if (bad) { err.textContent = bad[1]; bad[0][0]?.focus(); return; }
    go(step + 1);
  });
  $('[data-co-back]', form).addEventListener('click', () => go(step - 1));
  form.addEventListener('click', e => { const g = e.target.closest('[data-goto]'); if (g) go(Number(g.dataset.goto)); });
  form.addEventListener('input', e => { if (e.target.getAttribute('aria-invalid') === 'true') e.target.removeAttribute('aria-invalid'); });

  $('[data-go-checkout]').addEventListener('click', () => {
    if (!items().length) return;
    cartDlg.close();
    form.hidden = false; $('[data-co-done]', co).hidden = true;
    go(0); co.showModal();
  });

  // QR ilustrativo (padrão aleatório, não é um Pix real)
  const pix = $('[data-pix-art]');
  if (pix) {
    const n = 21, cells = []; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      const on = finder ? (x % 14 === 0 || x % 14 === 6 || y % 14 === 0 || y % 14 === 6 || ((x % 14) > 1 && (x % 14) < 5 && (y % 14) > 1 && (y % 14) < 5)) : Math.random() > 0.55;
      if (on) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    }
    pix.innerHTML = `<svg viewBox="0 0 ${n} ${n}" width="100%" height="100%" shape-rendering="crispEdges" fill="#1e1e1d">${cells.join('')}</svg>`;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = check(3); if (bad) { err.textContent = bad[1]; return; }
    const id = `DK${Date.now().toString().slice(-6)}`;
    const list = items();
    const order = {
      id, createdAt: new Date().toISOString(),
      customer: { name: val('name'), phone: val('phone'), email: val('email'), city: mode() === 'delivery' ? (val('city') === 'Outra' ? 'Outra cidade' : val('city')) : form.elements.store.value },
      items: list.map(({ p, qty }) => ({ id: p.id, name: p.name, qty, price: p.price })),
      delivery: mode() === 'pickup' ? `Retirada na loja (${form.elements.store.value})` : 'Entrega Dekorar',
      address: mode() === 'delivery' ? recvLabel() : '',
      payment: payLabel(), subtotal: subtotal(), fee: fee(), discount: discount(), total: total(),
      status: 'Novo', demo: true,
      shipping: { carrier: mode() === 'pickup' ? 'Retirada na Loja' : 'Caminhonete Dekorar', tracking: '', estimate: '', notes: '' }
    };
    const orders = store.get('dekorar-orders', []);
    store.set('dekorar-orders', [order, ...(Array.isArray(orders) ? orders : [])]);
    // o resumo enviado não leva dados de cartão nem CPF
    const msg = [`Olá! Fiz o pedido ${id} na loja online da Dekorar.`, '', ...list.map(({ p, qty }) => `- ${qty}x ${p.name}: ${money.format(p.price * qty)}`), '',
      `Recebimento: ${recvLabel()}`, `Pagamento: ${payLabel()}`, `Total (demonstrativo): ${money.format(total())}`, '', `Cliente: ${val('name')} · ${val('phone')}`].join('\n');
    // limpa os campos de cartão: nada fica guardado
    ['cc', 'ccname', 'ccexp', 'cvv'].forEach(n => { form.elements[n].value = ''; });
    $('[data-done-title]', co).textContent = `Pedido ${id} recebido`;
    $('[data-done-text]', co).textContent = `Obrigado, ${val('name').split(' ')[0]}! Esta é uma loja de demonstração: nenhum valor foi cobrado. Envie o resumo pelo WhatsApp para a equipe confirmar preço, estoque e ${mode() === 'pickup' ? 'a retirada' : 'a entrega'}.`;
    $('[data-done-wa]', co).href = `${WA}?text=${encodeURIComponent(msg)}`;
    form.hidden = true; $('[data-co-done]', co).hidden = false;
    cart = {}; saveCart(); render();
  });

  /* ---------- Início ---------- */
  render(); saveCart(); sync();
  const qp = params.get('produto');
  if (qp && byId.has(qp)) openProduct(qp);
})();
