/* Dekorar — interações da landing page.
   Animações com Motion (motion.dev), a mesma base dos componentes Motion Primitives,
   portados para HTML/CSS/JS puros. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const doc = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = window.Motion;
  const canMove = !!(M && !reduce);
  if (!canMove) doc.classList.remove('motion');
  const EASE = [0.16, 1, 0.3, 1];
  const WA = 'https://wa.me/5535984336650';
  const fmtInt = new Intl.NumberFormat('pt-BR');
  const PRODUCTS = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  const byId = new Map(PRODUCTS.map(p => [p.id, p]));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Header e progresso de leitura ---------- */
  const header = $('[data-header]');
  const bar = $('[data-progress]');
  let ticking = false;
  const onScroll = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 8);
    const max = doc.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Menu ---------- */
  const toggle = $('.menu-toggle');
  const menu = $('#menu');
  const setMenu = open => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.firstElementChild.textContent = open ? 'Fechar' : 'Menu';
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) menu.querySelector('a')?.focus({ preventScroll: true });
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); } });
  window.matchMedia('(min-width: 1181px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------- Seção atual ---------- */
  const navLinks = $$('[data-nav]');
  if ('IntersectionObserver' in window && navLinks.length) {
    const map = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      navLinks.forEach(a => a.removeAttribute('aria-current'));
      map.get(en.target.id)?.setAttribute('aria-current', 'true');
    }), { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* ---------- Motion Primitives: Text Effect (título da capa) ---------- */
  const title = $('[data-text-effect]');
  if (title) {
    const words = title.textContent.trim().split(/\s+/);
    title.setAttribute('aria-label', words.join(' '));
    title.innerHTML = words.map(w => `<span class="w" aria-hidden="true">${esc(w)}</span>`).join(' ');
    if (canMove) {
      M.animate($$('.w', title), { opacity: [0, 1], filter: ['blur(10px)', 'blur(0px)'], transform: ['translateY(18px)', 'translateY(0px)'] },
        { duration: 0.8, ease: EASE, delay: M.stagger(0.07, { startDelay: 0.2 }) });
    }
  }

  /* ---------- Motion Primitives: In View (entradas das seções) ---------- */
  if (canMove) {
    $$('[data-reveal]').forEach(el => {
      M.inView(el, () => { M.animate(el, { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0px)'] }, { duration: 0.8, ease: EASE }); }, { margin: '0px 0px -8% 0px' });
    });
    $$('[data-stagger]').forEach(group => {
      M.inView(group, () => { M.animate([...group.children], { opacity: [0, 1], transform: ['translateY(18px)', 'translateY(0px)'] }, { duration: 0.7, ease: EASE, delay: M.stagger(0.08) }); }, { margin: '0px 0px -8% 0px' });
    });
  }

  /* ---------- Fancy Components: Text Highlighter ---------- */
  $$('[data-highlight]').forEach(el => {
    if (!canMove) { el.classList.add('is-on'); return; }
    M.inView(el, () => { setTimeout(() => el.classList.add('is-on'), 300); }, { amount: 1 });
  });

  /* ---------- Motion Primitives: Animated Number ---------- */
  $$('[data-count]').forEach(el => {
    const target = Number(el.dataset.count);
    if (!canMove) { el.textContent = fmtInt.format(target); return; }
    el.textContent = '0';
    M.inView(el, () => { M.animate(0, target, { duration: 1.6, ease: EASE, onUpdate: v => { el.textContent = fmtInt.format(Math.round(v)); } }); }, { amount: 1 });
  });

  /* ---------- Motion Primitives: Infinite Slider (marcas) ---------- */
  $$('[data-slider]').forEach(slider => {
    if (reduce) return;
    const track = $('.slider-track', slider);
    [...track.children].forEach(li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.append(c); });
    slider.style.setProperty('--marquee-dur', `${Math.max(24, track.scrollWidth / 60)}s`);
    slider.classList.add('is-running');
  });

  /* ---------- Abas com fundo deslizante ---------- */
  const moveBg = (group, btn) => {
    const bg = $('.tabs-bg', group);
    if (!bg || !btn) return;
    bg.style.setProperty('--tx', `${btn.offsetLeft}px`);
    bg.style.setProperty('--ty', `${btn.offsetTop}px`);
    bg.style.setProperty('--tw', `${btn.offsetWidth}px`);
    bg.style.setProperty('--th', `${btn.offsetHeight}px`);
  };
  $$('[data-tabs]').forEach(list => {
    const tabs = $$('[role="tab"]', list);
    const select = (tab, focus) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      moveBg(list, tab);
      if (focus) tab.focus();
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
        if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
        if (e.key === 'End') { e.preventDefault(); select(tabs.at(-1), true); }
      });
    });
    requestAnimationFrame(() => moveBg(list, tabs.find(t => t.getAttribute('aria-selected') === 'true')));
  });
  window.addEventListener('resize', () => {
    $$('[data-tabs], [data-filter]').forEach(g => moveBg(g, $('[aria-selected="true"], [aria-pressed="true"]', g)));
  });

  /* ---------- Aviso curto ---------- */
  const toast = $('[data-toast]');
  let toastTimer;
  const showToast = msg => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 3200);
  };

  /* ---------- Produtos: tudo leva para a loja online (produtos.html) ---------- */
  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const shopUrl = id => `produtos.html?produto=${encodeURIComponent(id)}`;
  $$('[data-linha]').forEach(panel => {
    const items = panel.dataset.linha.split(' ').map(id => byId.get(id)).filter(Boolean);
    panel.innerHTML = `<ul class="prod-rows">${items.map(p => `
      <li class="prod-row"><div><strong>${esc(p.name.replace(' Dkorar', ''))}</strong><p>${esc(p.description)}</p></div>
      <div class="row-side"><span class="row-price">${money.format(p.price)}</span><a class="add" href="${shopUrl(p.id)}">Comprar</a></div></li>`).join('')}</ul>`;
  });
  const cardHTML = p => `<li class="card">
      <a class="card-media is-pack" href="${shopUrl(p.id)}" tabindex="-1" aria-hidden="true"><img src="${p.image}" alt="" loading="lazy" decoding="async"></a>
      <p class="card-brand" translate="no">${esc(p.brand)}</p>
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.description)}</p>
      <div class="card-actions"><span class="card-price">${money.format(p.price)}</span><a class="add" href="${shopUrl(p.id)}" aria-label="Comprar ${esc(p.name)}">Comprar</a></div>
    </li>`;
  $$('[data-step]').forEach(panel => {
    const items = panel.dataset.step.split(' ').map(id => byId.get(id)).filter(Boolean);
    panel.insertAdjacentHTML('beforeend', `<ul class="step-cards">${items.map(cardHTML).join('')}</ul>`);
  });
  $$('[data-featured]').forEach(list => {
    const items = list.dataset.featured.split(' ').map(id => byId.get(id)).filter(Boolean);
    list.innerHTML = items.map(p => `<li><a class="feat" href="${shopUrl(p.id)}">
      <span class="feat-media"><img src="${p.image}" alt="" loading="lazy" decoding="async"></span>
      <span class="feat-brand" translate="no">${esc(p.brand)}</span>
      <h3>${esc(p.name)}</h3>
      <span class="feat-price">${money.format(p.price)}</span></a></li>`).join('');
  });

  /* ---------- Ficha de orçamento (WhatsApp) ---------- */
  const form = $('[data-builder]');
  const storePhoto = $('[data-store-photo]');
  const storeSource = $('[data-store-source]');
  const storePhotos = {
    Lavras: {
      webp: 'assets/img/fachada-entrega',
      avif: 'assets/img/fachada-entrega',
      alt: 'Fachada da loja Dekorar de Lavras, branca com moldura laranja, número 91'
    },
    'Três Corações': {
      webp: 'assets/img/fachada-tres-coracoes',
      avif: 'assets/img/fachada-tres-coracoes',
      alt: 'Fachada da loja Dekorar de Três Corações, azul com letreiro amarelo da Dekorar e da Coral'
    }
  };
  function updateStorePhoto() {
    if (!form || !storePhoto) return;
    const loja = $('input[name="loja"]:checked', form)?.value || 'Lavras';
    const photo = storePhotos[loja] || storePhotos.Lavras;
    storePhoto.classList.add('is-changing');
    if (storeSource) storeSource.srcset = `${photo.avif}-sm.avif 640w, ${photo.avif}-md.avif 1080w, ${photo.avif}-lg.avif 1800w`;
    storePhoto.src = `${photo.webp}-md.webp`;
    storePhoto.srcset = `${photo.webp}-sm.webp 640w, ${photo.webp}-md.webp 1080w, ${photo.webp}-lg.webp 1800w`;
    storePhoto.alt = photo.alt;
    requestAnimationFrame(() => storePhoto.classList.remove('is-changing'));
  }
  function message() {
    const loja = $('input[name="loja"]:checked', form)?.value || 'Lavras';
    const receber = $('input[name="receber"]:checked', form)?.value;
    const detalhes = $('textarea[name="detalhes"]', form)?.value.trim();
    const lines = ['Olá, vim pelo site da Dekorar e quero um orçamento.', `Loja: ${loja}.`];
    lines.push(receber === 'retirada' ? `Vou retirar na loja de ${loja}.` : 'Preciso de entrega na obra.');
    if (detalhes) lines.push(`Detalhes: ${detalhes}`);
    return lines.join('\n');
  }
  function compose() {
    if (!form) return;
    const t = message();
    $('[data-preview]', form).textContent = t;
    $('[data-text]', form).value = t;
  }
  form?.addEventListener('input', compose);
  form?.addEventListener('change', () => { compose(); updateStorePhoto(); });
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const url = `${WA}?text=${encodeURIComponent(message())}`;
    const w = window.open(url, '_blank', 'noopener');
    if (!w) window.location.href = url;
  });
  compose();
  updateStorePhoto();

  /* ---------- Watermelon UI: Copy Confirm ---------- */
  const copyText = async text => {
    try { await navigator.clipboard.writeText(text); return true; } catch {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.append(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; } ta.remove(); return ok;
    }
  };
  const confirmCopy = (btn, ok) => {
    const label = $('.copy-label', btn); const old = label.dataset.old || label.textContent;
    label.dataset.old = old;
    label.textContent = ok ? 'Copiado' : 'Não deu para copiar';
    btn.classList.remove('is-copied'); void btn.offsetWidth; btn.classList.add('is-copied');
    clearTimeout(btn._t); btn._t = setTimeout(() => { label.textContent = old; }, 1800);
  };
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => confirmCopy(btn, await copyText(btn.dataset.copy))));

  /* ---------- Leitor de cor (Canvas UI: Magnify + Motion Primitives: Text Scramble) ---------- */
  const reader = $('[data-reader]');
  if (reader) {
    const canvas = $('[data-reader-canvas]', reader);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const loupe = $('[data-loupe]', reader);
    const lctx = $('canvas', loupe).getContext('2d');
    const swatch = $('[data-swatch]', reader);
    const hexEl = $('[data-hex]', reader);
    const rgbEl = $('[data-rgb]', reader);
    const nearEl = $('[data-near]', reader);
    const nameEl = $('[data-name]', reader);
    const pick = $('[data-pick]', reader);
    const pickSw = $('[data-pick-swatch]', reader), pickName = $('[data-pick-name]', reader), pickHex = $('[data-pick-hex]', reader);
    const waBtn = $('[data-reader-wa]', reader);
    const copyHex = $('[data-copy-hex]', reader);
    // Tons de referência ilustrativos (não são códigos de fabricante)
    const TONES = [
      ['Branco', '#f6f5f1'], ['Gelo', '#e9ebe8'], ['Pérola', '#ece6da'], ['Palha', '#e6d9b8'], ['Areia', '#d8c6a4'], ['Camurça', '#c4a57f'],
      ['Bege parede', '#d9c4a5'], ['Concreto', '#b9b7b1'], ['Cinza médio', '#8f8d88'], ['Grafite', '#4a4a48'], ['Preto', '#1f1f1f'],
      ['Laranja', '#e8561f'], ['Terracota', '#b5543a'], ['Telha', '#9c4a32'], ['Amarelo', '#f2c14e'], ['Mostarda', '#c99a2e'],
      ['Verde oliva', '#7a7d4a'], ['Verde folha', '#4f7a43'], ['Verde água', '#9fd3c7'], ['Azul céu', '#9cc3e4'], ['Azul royal', '#2f4f9a'],
      ['Azul marinho', '#203255'], ['Vermelho', '#b32025'], ['Vinho', '#6e2232'], ['Rosa claro', '#ecc6c9'], ['Lilás', '#b7a6cf'],
      ['Marrom', '#6b4a33'], ['Madeira', '#9a6b43'], ['Creme', '#f0e3c4'], ['Salmão', '#f0a383']
    ];
    const toLab = hex => {
      const n = parseInt(hex.slice(1), 16); let r = (n >> 16) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
      [r, g, b] = [r, g, b].map(c => (c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92));
      let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047, y = r * 0.2126 + g * 0.7152 + b * 0.0722, z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
      [x, y, z] = [x, y, z].map(c => (c > 0.008856 ? Math.cbrt(c) : 7.787 * c + 16 / 116));
      return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
    };
    const TONES_LAB = TONES.map(([n, h]) => [n, h, toLab(h)]);
    // hexadecimal da cor (taste-skill-ignore: não é numeração de seção)
    const hexOf = (r, g, b) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    const fmt1 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
    let img = null, point = { x: 0, y: 0 }, current = '#000000', scrambleTimer = null;

    const scramble = (el, finalText) => {
      if (!canMove) { el.textContent = finalText; return; }
      const chars = '0123456789ABCDEF'; let frame = 0; clearInterval(scrambleTimer);
      scrambleTimer = setInterval(() => {
        frame++;
        el.textContent = finalText.split('').map((c, i) => (i === 0 || i < frame - 1 ? c : chars[Math.floor(Math.random() * 16)])).join('');
        if (frame > finalText.length + 1) { clearInterval(scrambleTimer); el.textContent = finalText; }
      }, 32);
    };
    const read = (x, y, animate) => {
      if (!img) return;
      x = Math.max(2, Math.min(canvas.width - 3, Math.round(x))); y = Math.max(2, Math.min(canvas.height - 3, Math.round(y)));
      point = { x, y };
      const d = ctx.getImageData(x - 2, y - 2, 5, 5).data; let r = 0, g = 0, b = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      r = Math.round(r / 25); g = Math.round(g / 25); b = Math.round(b / 25);
      const hex = hexOf(r, g, b).toUpperCase();
      current = hex;
      swatch.style.backgroundColor = hex;
      if (animate) scramble(hexEl, hex); else { clearInterval(scrambleTimer); hexEl.textContent = hex; }
      rgbEl.textContent = `RGB ${r}, ${g}, ${b}`;
      const lab = toLab(hex);
      const near = TONES_LAB.map(([n, h, l]) => [n, h, Math.hypot(l[0] - lab[0], l[1] - lab[1], l[2] - lab[2])]).sort((a, b) => a[2] - b[2]).slice(0, 4);
      nameEl.textContent = near[0][0];
      pickSw.style.backgroundColor = hex; pickName.textContent = near[0][0]; pickHex.textContent = hex;
      nearEl.innerHTML = near.map(([n, h, de]) => `<li><button type="button" data-tone="${h}" aria-label="Copiar ${n}, ${h.toUpperCase()}"><i style="background:${h}"></i><span>${n}</span><small>ΔE ${fmt1.format(de)}</small></button></li>`).join('');
      waBtn.href = `${WA}?text=${encodeURIComponent(`Olá! Usei o leitor de cor no site da Dekorar e encontrei a cor ${hex} (RGB ${r}, ${g}, ${b}). Quero tinta nesse tom (parecido com ${near[0][0]}).`)}`;
    };
    const drawLoupe = (cx, cy, rect) => {
      const s = 12; lctx.imageSmoothingEnabled = false;
      lctx.clearRect(0, 0, 140, 140);
      lctx.drawImage(canvas, Math.round(cx - s / 2), Math.round(cy - s / 2), s, s, 0, 0, 140, 140);
      const k = rect.width / canvas.width;
      loupe.style.left = `${cx * k}px`; loupe.style.top = `${cy * k - 90}px`;
      // etiqueta com o nome da cor logo abaixo do cursor, sem sair da foto
      const px = Math.max(90, Math.min(rect.width - 90, cx * k));
      const py = cy * k + 22 > rect.height - 52 ? cy * k - 190 : cy * k + 22;
      pick.style.left = `${px}px`; pick.style.top = `${py}px`;
      pick.classList.add('is-on');
    };
    const load = src => new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => {
        const max = 900; const k = Math.min(1, max / im.naturalWidth);
        canvas.width = Math.round(im.naturalWidth * k); canvas.height = Math.round(im.naturalHeight * k);
        ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
        img = im; resolve();
      };
      im.onerror = reject;
      im.src = src;
    });
    const fromEvent = e => { const r = canvas.getBoundingClientRect(); const k = canvas.width / r.width; return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k, r }; };
    let dragging = false;
    canvas.addEventListener('pointerdown', e => { dragging = true; canvas.setPointerCapture(e.pointerId); const p = fromEvent(e); read(p.x, p.y, false); drawLoupe(p.x, p.y, p.r); loupe.classList.add('is-on'); });
    canvas.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' && !dragging) return;
      const p = fromEvent(e);
      read(p.x, p.y, false);
      drawLoupe(p.x, p.y, p.r); loupe.classList.add('is-on');
    });
    const end = () => { dragging = false; loupe.classList.remove('is-on'); pick.classList.remove('is-on'); };
    canvas.addEventListener('pointerup', e => { end(); const p = fromEvent(e); read(p.x, p.y, true); });
    canvas.addEventListener('pointerleave', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('keydown', e => {
      const step = e.shiftKey ? 40 : 10;
      const mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
      if (!mv) return;
      e.preventDefault(); read(point.x + mv[0], point.y + mv[1], false);
      const r = canvas.getBoundingClientRect(); drawLoupe(point.x, point.y, r); loupe.classList.add('is-on');
      clearTimeout(canvas._t); canvas._t = setTimeout(() => { loupe.classList.remove('is-on'); pick.classList.remove('is-on'); }, 900);
    });
    nearEl.addEventListener('click', async e => {
      const b = e.target.closest('[data-tone]'); if (!b) return;
      const ok = await copyText(b.dataset.tone.toUpperCase());
      showToast(ok ? `Código ${b.dataset.tone.toUpperCase()} copiado` : 'Não deu para copiar');
    });
    copyHex.addEventListener('click', async () => confirmCopy(copyHex, await copyText(current)));
    const sources = $$('[data-src]');
    const choose = async (btn, xr, yr) => {
      sources.forEach(s => s.setAttribute('aria-pressed', String(s === btn)));
      await load(btn.dataset.src);
      read(canvas.width * xr, canvas.height * yr, true);
    };
    const defaults = { 0: [0.42, 0.3], 1: [0.62, 0.3], 2: [0.6, 0.7] };
    sources.forEach((s, i) => s.addEventListener('click', () => choose(s, ...(defaults[i] || [0.5, 0.5]))));
    $('[data-reader-file]').addEventListener('change', async e => {
      const f = e.target.files?.[0]; if (!f) return;
      const url = URL.createObjectURL(f);
      sources.forEach(s => s.setAttribute('aria-pressed', 'false'));
      try { await load(url); read(canvas.width / 2, canvas.height / 2, true); showToast('Foto carregada. Toque na parede para ler a cor.'); }
      catch { showToast('Não foi possível abrir essa imagem.'); }
      finally { URL.revokeObjectURL(url); }
    });
    // carrega a primeira foto quando a seção chegar perto
    const start = () => choose(sources[0], ...defaults[0]);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '400px' });
      io.observe(reader);
    } else start();
  }

  /* ---------- Fancy Components: Element Along SVG Path (rota da caminhonete) ---------- */
  const route = $('[data-route]');
  if (route) {
    const path = $('[data-route-path]', route);
    const done = $('[data-route-done]', route);
    const truck = $('[data-truck]', route);
    const cities = $$('.city', route);
    const L = path.getTotalLength();
    done.style.strokeDasharray = `${L}`;
    // posição de cada cidade ao longo da rota
    const cityAt = cities.map(c => {
      const m = c.getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/);
      const cx = +m[1], cy = +m[2]; let best = 0, bd = Infinity;
      for (let s = 0; s <= L; s += 4) { const pt = path.getPointAtLength(s); const d = Math.hypot(pt.x - cx, pt.y - cy); if (d < bd) { bd = d; best = s; } }
      return best;
    });
    const place = p => {
      const s = L * p;
      done.style.strokeDashoffset = `${L - s}`;
      const a = path.getPointAtLength(Math.max(0, s - 1)), b = path.getPointAtLength(Math.min(L, s + 1));
      const pt = path.getPointAtLength(s);
      let ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      const flip = Math.abs(ang) > 90;
      truck.setAttribute('transform', `translate(${pt.x} ${pt.y - 12}) rotate(${flip ? ang + 180 : ang}) scale(${flip ? -1 : 1} 1)`);
      cities.forEach((c, i) => c.classList.toggle('is-lit', s >= cityAt[i] - 2));
    };
    if (canMove) {
      // o trajeto termina (Lavras → Três Corações → Varginha) enquanto o mapa ainda está inteiro na tela
      const svg = $('svg', route);
      const run = p => place(Math.min(1, Math.max(0, p / 0.85)));
      let stop = null;
      const bind = () => {
        stop?.();
        const sticky = getComputedStyle(route).position === 'sticky';
        stop = sticky
          ? M.scroll(run, { target: $('.entrega-grid'), offset: ['start 75%', 'end end'] })
          : M.scroll(run, { target: svg, offset: ['start 95%', 'end 75%'] });
      };
      bind();
      window.matchMedia('(max-width: 900px)').addEventListener('change', bind);
    } else place(1);
  }
  $('[data-city-check]')?.addEventListener('submit', e => {
    e.preventDefault();
    const c = e.target.cidade.value.trim(); if (!c) return;
    const url = `${WA}?text=${encodeURIComponent(`Olá! Vocês fazem entrega em ${c}?`)}`;
    const w = window.open(url, '_blank', 'noopener'); if (!w) window.location.href = url;
  });

  /* ---------- Galeria ---------- */
  const photos = [
    ['fachada-entardecer', 'Fachada da loja de Lavras ao entardecer.'],
    ['estoque-prateleiras', 'Baldes de 18 e 20 litros separados por marca e linha.'],
    ['estoque-galpao', 'Galpão de estoque, pronto para separar pedidos de obra.'],
    ['coralit-prateleira', 'Esmaltes Coral Coralit em várias cores.'],
    ['prateleira-acotone', 'Prateleiras com produtos Coral e complementos.'],
    ['prateleira-coral-anjo', 'Coral e Anjo lado a lado, do galão ao balde.'],
    ['coralit-galoes', 'Galões de esmalte Coralit empilhados.'],
    ['atendimento-mesas', 'Mesas de atendimento da equipe Dekorar.'],
    ['atendimento-suvinil', 'Cartela de cores Suvinil e mesa de atendimento.'],
    ['dkorar-balde', 'Dkorar Tintas Especiais, a marca própria da casa.'],
    ['fachada-entrega', 'Caminhonete de entrega em frente à loja de Lavras.'],
    ['fachada-tres-coracoes', 'Fachada da loja de Três Corações.'],
    ['totem-noite', 'Totem da loja de Lavras à noite, com as marcas da casa.'],
  ];
  const lb = $('[data-lightbox]');
  if (lb && typeof lb.showModal === 'function') {
    const im = $('[data-lightbox-img]', lb), cap = $('[data-lightbox-cap]', lb), cnt = $('[data-lightbox-count]', lb);
    let index = 0, opener = null;
    const size = () => (window.innerWidth > 1100 ? 'lg' : 'md');
    const show = i => {
      index = (i + photos.length) % photos.length;
      const [name, text] = photos[index];
      if (!reduce) { im.classList.remove('is-swapping'); void im.offsetWidth; im.classList.add('is-swapping'); }
      im.src = `assets/img/${name}-${size()}.webp`; im.alt = text; cap.textContent = text;
      cnt.textContent = `Foto ${index + 1} de ${photos.length}`;
      new Image().src = `assets/img/${photos[(index + 1) % photos.length][0]}-${size()}.webp`;
    };
    $$('[data-gallery-open]').forEach(b => b.addEventListener('click', () => { opener = b; show(Number(b.dataset.galleryOpen) || 0); lb.showModal(); $('[data-lightbox-next]', lb).focus(); }));
    $('[data-lightbox-prev]', lb).addEventListener('click', () => show(index - 1));
    $('[data-lightbox-next]', lb).addEventListener('click', () => show(index + 1));
    $('[data-lightbox-close]', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('close', () => opener?.focus());
    lb.addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(index + 1); if (e.key === 'ArrowLeft') show(index - 1); });
    lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lightbox-figure')) lb.close(); });
    let sx = null;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1)); sx = null; });
  } else $$('[data-gallery-open]').forEach(b => { b.hidden = true; });

  $$('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
})();
