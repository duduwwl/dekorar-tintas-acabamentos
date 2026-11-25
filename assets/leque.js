/* Leque de cores interativo: uma lâmina por família, abertura da família em tiras, busca por nome ou código,
   escolha do tom e do produto. Dados em leque-data.js: família -> lâminas -> [nome, código, hex sem #]. */
(() => {
  'use strict';
  const root = document.querySelector('[data-leque]');
  if (!root || !window.LEQUE) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = 'https://wa.me/5535984336650';
  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const num = new Intl.NumberFormat('pt-BR');
  const STRIP = 8;  // tons por tira, do claro ao escuro, como no leque físico

  const fan = $('[data-fan]'), blade = $('[data-blade]'), card = $('[data-pick-card]');
  const tabs = $$('[role="tab"]'), tabBg = $('.tabs-bg'), panel = $('#leque-panel');
  let brand = 'Coral', family = 0, picked = null;

  // texto escuro ou claro sobre o tom (contraste WCAG)
  const lum = h => { const n = parseInt(h, 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const inkOn = h => (lum(h) > 0.22 ? '#1e1e1d' : '#ffffff');
  const tones = f => f.blades.flat();
  const total = b => window.LEQUE[b].reduce((a, f) => a + tones(f).length, 0);
  const strips = f => f.blades.flatMap(b => { const out = []; for (let i = 0; i < b.length; i += STRIP) out.push(b.slice(i, i + STRIP)); return out; });
  // código que a loja usa para achar a cor: Suvinil tem código próprio; na Coral o nome identifica a cor
  const codeOf = t => (brand === 'Suvinil' ? t[1] : '');

  const products = () => (window.PRODUCTS || []).filter(p => p.brand === brand && ['Tintas', 'Esmaltes'].includes(p.category));

  /* ---------- Leque: uma lâmina por família, com amostras do claro ao escuro ---------- */
  const sample = f => { const all = tones(f).slice().sort((a, b) => lum(b[2]) - lum(a[2])); const n = 9; return Array.from({ length: n }, (_, i) => all[Math.round(i * (all.length - 1) / (n - 1))]); };
  const drawFan = () => {
    const fams = window.LEQUE[brand];
    const n = fams.length, spread = Math.min(112, 10 * n);
    fan.style.setProperty('--n', n);
    fan.innerHTML = fams.map((f, i) => {
      const ang = -spread / 2 + (spread / (n - 1)) * i;
      return `<button type="button" class="fan-blade" style="--a:${ang}deg;--i:${i}" data-family="${i}" aria-pressed="${i === family}" aria-label="${esc(f.name)}, ${tones(f).length} tons">
        ${sample(f).map(t => `<i style="background:#${t[2]}"></i>`).join('')}
        <span class="fan-label">${esc(f.name)}</span></button>`;
    }).join('') + '<span class="fan-pin" aria-hidden="true"></span>';
    $('[data-brand-count]').textContent = `${num.format(total(brand))} cores oficiais ${brand}`;
  };

  /* ---------- Família aberta: tiras de 8 tons ---------- */
  const tone = t => `<li><button type="button" class="tone-btn" data-hex="${t[2]}" data-name="${esc(t[0])}" data-code="${esc(codeOf(t))}" aria-pressed="${picked?.name === t[0] && picked?.hex === t[2]}" style="--c:#${t[2]};--on:${inkOn(t[2])}"><span>${esc(t[0])}</span>${codeOf(t) ? `<small>${esc(codeOf(t))}</small>` : ''}</button></li>`;
  const famNav = () => {
    const fams = window.LEQUE[brand];
    return `<div class="blade-nav">
      <button type="button" class="blade-step" data-step-fam="-1" aria-label="Família anterior: ${esc(fams[(family - 1 + fams.length) % fams.length].name)}">‹</button>
      <button type="button" class="blade-step" data-step-fam="1" aria-label="Próxima família: ${esc(fams[(family + 1) % fams.length].name)}">›</button></div>`;
  };
  const drawFamily = () => {
    const f = window.LEQUE[brand][family];
    blade.innerHTML = `<div class="blade-head"><div><h2 class="h3">${esc(f.name)}</h2><span class="count-pill">${tones(f).length} tons · ${brand}</span></div>${famNav()}</div>
      <div class="blade-strips">${strips(f).map((s, i) => `<ul class="blade-col" style="--k:${i}">${s.map(tone).join('')}</ul>`).join('')}</div>`;
  };
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const drawSearch = q => {
    const nq = norm(q);
    const fams = window.LEQUE[brand];
    const byFamily = fams.filter(f => norm(f.name).includes(nq)).flatMap(tones);
    const byName = fams.flatMap(tones).filter(t => norm(t[0]).includes(nq) || norm(t[1]) === nq);
    const hits = [...new Map([...byName, ...byFamily].map(t => [t[1], t])).values()];
    const shown = hits.slice(0, 160);
    blade.innerHTML = `<div class="blade-head"><div><h2 class="h3">Busca: ${esc(q)}</h2><span class="count-pill">${hits.length} ${hits.length === 1 ? 'tom' : 'tons'}${hits.length > shown.length ? ` · mostrando ${shown.length}` : ''}</span></div></div>` +
      (hits.length ? `<ul class="blade-grid">${shown.map(tone).join('')}</ul>` : `<p class="blade-empty">Nenhuma cor ${brand} com esse nome. Tente uma família (azul, verde, cinza) ou o nome da cor.</p>`);
  };

  /* ---------- Tom escolhido: cartão com produto e WhatsApp ---------- */
  const label = () => (picked.code ? `${picked.name} (${picked.code})` : picked.name);
  const updateWa = () => {
    if (!picked) return;
    const prod = $('input[name="leque-produto"]:checked')?.value;
    const msg = `Olá! Escolhi no leque de cores do site da Dekorar a cor ${label()} da ${brand}.` + (prod ? ` Produto: ${prod}.` : '') + ' Podem preparar e confirmar o valor?';
    $('[data-pick-wa]').href = `${WA}?text=${encodeURIComponent(msg)}`;
    $('[data-pick-wa]').dataset.msg = msg;
  };
  const pick = btn => {
    picked = { hex: btn.dataset.hex, name: btn.dataset.name, code: btn.dataset.code };
    $$('.tone-btn').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    card.hidden = false;
    $('[data-pick-swatch]').style.background = `#${picked.hex}`;
    $('[data-pick-brand]').textContent = `Leque ${brand}`;
    $('[data-pick-name]').textContent = picked.name;
    $('[data-pick-code]').textContent = picked.code ? `Código ${picked.code}` : 'Cor da cartela Coral';
    const list = products();
    $('[data-pick-products]').innerHTML = list.length
      ? list.map((p, i) => `<label class="pick-prod"><input type="radio" name="leque-produto" value="${esc(p.name)}"${i === 0 ? ' checked' : ''}><img src="${esc(p.image)}" alt="" loading="lazy" width="56" height="56"><span><strong>${esc(p.name)}</strong><small>${esc(p.package || '')} · ${money.format(p.price)}</small></span></label>`).join('')
      : '<p class="blade-empty">Peça pelo WhatsApp e a equipe indica o produto certo.</p>';
    updateWa();
    if (matchMedia('(max-width: 900px)').matches) card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  };

  /* ---------- Abas de marca (Coral / Suvinil) ---------- */
  const moveBg = t => { if (!tabBg || !t) return; tabBg.style.setProperty('--tx', `${t.offsetLeft}px`); tabBg.style.setProperty('--ty', `${t.offsetTop}px`); tabBg.style.setProperty('--tw', `${t.offsetWidth}px`); tabBg.style.setProperty('--th', `${t.offsetHeight}px`); };
  const setFamily = i => {
    const n = window.LEQUE[brand].length;
    family = (i + n) % n;
    $$('.fan-blade').forEach(x => x.setAttribute('aria-pressed', String(Number(x.dataset.family) === family)));
    $('[data-leque-search]').value = '';
    drawFamily();
  };
  const setBrand = (t, focus) => {
    tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; });
    panel.setAttribute('aria-labelledby', t.id);
    moveBg(t); if (focus) t.focus();
    brand = t.dataset.brand; family = 0; picked = null; card.hidden = true;
    $('[data-leque-search]').value = '';
    drawFan(); drawFamily();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => setBrand(t));
    t.addEventListener('keydown', e => { const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (k) { e.preventDefault(); setBrand(tabs[(i + k + tabs.length) % tabs.length], true); } });
  });
  addEventListener('resize', () => moveBg(tabs.find(t => t.getAttribute('aria-selected') === 'true')));

  fan.addEventListener('click', e => { const b = e.target.closest('[data-family]'); if (b) setFamily(Number(b.dataset.family)); });
  blade.addEventListener('click', e => {
    const step = e.target.closest('[data-step-fam]');
    if (step) { setFamily(family + Number(step.dataset.stepFam)); $(`[data-step-fam="${step.dataset.stepFam}"]`)?.focus(); return; }
    const b = e.target.closest('.tone-btn'); if (b) pick(b);
  });
  card.addEventListener('change', updateWa);
  let typing;
  $('[data-leque-search]').addEventListener('input', e => { clearTimeout(typing); const q = e.target.value.trim(); typing = setTimeout(() => (q.length > 1 ? drawSearch(q) : drawFamily()), 140); });
  $('[data-pick-wa]').addEventListener('click', e => { window.DekorarDB?.createLead({ message: e.currentTarget.dataset.msg || '', source: `leque-${brand}` }).catch(() => {}); });
  $('[data-copy-color]').addEventListener('click', async e => {
    if (!picked) return;
    const btn = e.currentTarget, lbl = $('.copy-label', btn);
    let ok = true; try { await navigator.clipboard.writeText(`${brand} ${label()}`); } catch { ok = false; }
    lbl.textContent = ok ? 'Copiado' : 'Não deu para copiar';
    setTimeout(() => { lbl.textContent = 'Copiar nome da cor'; }, 1800);
  });

  // ?marca=Suvinil abre direto no leque da Suvinil
  const qs = new URLSearchParams(location.search);
  const q = qs.get('marca');
  const start = tabs.find(t => t.dataset.brand.toLowerCase() === (q || '').toLowerCase()) || tabs[0];
  setBrand(start);
  // ?familia=N abre direto na família N da marca (usado pelos cards da home)
  const fi = Number(qs.get('familia'));
  if (Number.isInteger(fi) && fi >= 0 && fi < window.LEQUE[brand].length) setFamily(fi);
})();
