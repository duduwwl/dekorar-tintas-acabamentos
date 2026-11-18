/* Leque de cores interativo: lâminas em leque, abertura da família, escolha do tom e do produto. */
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

  const fan = $('[data-fan]'), blade = $('[data-blade]'), card = $('[data-pick-card]');
  const tabs = $$('[role="tab"]'), tabBg = $('.tabs-bg'), panel = $('#leque-panel');
  let brand = 'Coral', family = 0, picked = null;

  // texto escuro ou claro sobre o tom (contraste WCAG)
  const lum = h => { const n = parseInt(h.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const inkOn = h => (lum(h) > 0.22 ? '#1e1e1d' : '#ffffff');

  const products = () => (window.PRODUCTS || []).filter(p => p.brand === brand && ['Tintas', 'Esmaltes'].includes(p.category));

  /* ---------- Leque: uma lâmina por família, abertas em arco ---------- */
  const drawFan = () => {
    const fams = window.LEQUE[brand];
    const n = fams.length, spread = 100;
    fan.innerHTML = fams.map((f, i) => {
      const ang = -spread / 2 + (spread / (n - 1)) * i;
      const tones = f.blades[1];
      return `<button type="button" class="fan-blade" style="--a:${ang}deg;--i:${i}" data-family="${i}" aria-pressed="${i === family}" aria-label="${esc(f.name)}">
        ${tones.map(t => `<i style="background:${t.hex}"></i>`).join('')}
        <span class="fan-label">${esc(f.name)}</span></button>`;
    }).join('') + '<span class="fan-pin" aria-hidden="true"></span>';
    if (!reduce) { fan.classList.remove('is-open'); void fan.offsetWidth; }
    requestAnimationFrame(() => fan.classList.add('is-open'));
  };

  /* ---------- Família aberta: as três lâminas com os sete tons ---------- */
  const tone = t => `<li><button type="button" class="tone-btn" data-hex="${t.hex}" data-name="${esc(t.name)}" data-code="${t.code}" aria-pressed="${picked?.code === t.code}" style="--c:${t.hex};--on:${inkOn(t.hex)}"><span>${esc(t.name)}</span><small>${t.code}</small></button></li>`;
  const drawFamily = () => {
    const f = window.LEQUE[brand][family];
    blade.innerHTML = `<div class="blade-head"><h2 class="h3">${esc(f.name)}</h2><span class="count-pill">${f.blades.length * f.blades[0].length} tons · ${brand}</span></div>
      <div class="blade-cols">${f.blades.map(b => `<ul class="blade-col">${b.map(tone).join('')}</ul>`).join('')}</div>`;
  };
  const drawSearch = q => {
    const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const nq = norm(q);
    const hits = window.LEQUE[brand].filter(f => norm(f.name).includes(nq) || norm(f.code) === nq).flatMap(f => f.blades.flat());
    blade.innerHTML = `<div class="blade-head"><h2 class="h3">Busca: ${esc(q)}</h2><span class="count-pill">${hits.length} tons</span></div>` +
      (hits.length ? `<ul class="blade-grid">${hits.map(tone).join('')}</ul>` : '<p class="blade-empty">Nenhuma família com esse nome. Tente azul, verde, areia, cinza ou branco.</p>');
  };

  /* ---------- Tom escolhido: cartão com produto e WhatsApp ---------- */
  const updateWa = () => {
    if (!picked) return;
    const prod = $('input[name="leque-produto"]:checked')?.value;
    const msg = `Olá! Escolhi no leque de cores do site da Dekorar a cor ${picked.name} (${picked.code}, ${picked.hex.toUpperCase()}) do leque ${brand}.` + (prod ? ` Produto: ${prod}.` : '') + ' Podem conferir o código oficial e preparar?';
    $('[data-pick-wa]').href = `${WA}?text=${encodeURIComponent(msg)}`;
    $('[data-pick-wa]').dataset.msg = msg;
  };
  const pick = btn => {
    picked = { hex: btn.dataset.hex, name: btn.dataset.name, code: btn.dataset.code };
    $$('.tone-btn').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    card.hidden = false;
    $('[data-pick-swatch]').style.background = picked.hex;
    $('[data-pick-brand]').textContent = `Leque ${brand} · referência`;
    $('[data-pick-name]').textContent = picked.name;
    $('[data-pick-code]').textContent = `${picked.code} · ${picked.hex.toUpperCase()}`;
    const list = products();
    $('[data-pick-products]').innerHTML = list.length
      ? list.map((p, i) => `<label class="pick-prod"><input type="radio" name="leque-produto" value="${esc(p.name)}"${i === 0 ? ' checked' : ''}><img src="${esc(p.image)}" alt="" loading="lazy" width="56" height="56"><span><strong>${esc(p.name)}</strong><small>${esc(p.package || '')} · ${money.format(p.price)}</small></span></label>`).join('')
      : '<p class="blade-empty">Peça pelo WhatsApp e a equipe indica o produto certo.</p>';
    updateWa();
    if (matchMedia('(max-width: 900px)').matches) card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  };

  /* ---------- Abas de marca (Coral / Suvinil) ---------- */
  const moveBg = t => { if (!tabBg) return; tabBg.style.setProperty('--tx', `${t.offsetLeft}px`); tabBg.style.setProperty('--ty', `${t.offsetTop}px`); tabBg.style.setProperty('--tw', `${t.offsetWidth}px`); tabBg.style.setProperty('--th', `${t.offsetHeight}px`); };
  const setBrand = (t, focus) => {
    tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; });
    panel.setAttribute('aria-labelledby', t.id);
    moveBg(t); if (focus) t.focus();
    brand = t.dataset.brand; picked = null; card.hidden = true;
    $('[data-leque-search]').value = '';
    drawFan(); drawFamily();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => setBrand(t));
    t.addEventListener('keydown', e => { const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (k) { e.preventDefault(); setBrand(tabs[(i + k + tabs.length) % tabs.length], true); } });
  });
  addEventListener('resize', () => moveBg(tabs.find(t => t.getAttribute('aria-selected') === 'true')));

  fan.addEventListener('click', e => {
    const b = e.target.closest('[data-family]'); if (!b) return;
    family = Number(b.dataset.family);
    $$('.fan-blade').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    $('[data-leque-search]').value = '';
    drawFamily();
  });
  blade.addEventListener('click', e => { const b = e.target.closest('.tone-btn'); if (b) pick(b); });
  card.addEventListener('change', updateWa);
  $('[data-leque-search]').addEventListener('input', e => { const q = e.target.value.trim(); q ? drawSearch(q) : drawFamily(); });
  $('[data-pick-wa]').addEventListener('click', e => { window.DekorarDB?.createLead({ message: e.currentTarget.dataset.msg || '', source: `leque-${brand}` }).catch(() => {}); });
  $('[data-copy-color]').addEventListener('click', async e => {
    if (!picked) return;
    const btn = e.currentTarget, label = $('.copy-label', btn);
    let ok = true; try { await navigator.clipboard.writeText(`${picked.code} ${picked.hex.toUpperCase()}`); } catch { ok = false; }
    label.textContent = ok ? 'Copiado' : 'Não deu para copiar';
    setTimeout(() => { label.textContent = 'Copiar código'; }, 1800);
  });

  // ?marca=Suvinil abre direto no leque da Suvinil
  const q = new URLSearchParams(location.search).get('marca');
  const start = tabs.find(t => t.dataset.brand.toLowerCase() === (q || '').toLowerCase()) || tabs[0];
  setBrand(start);
})();
