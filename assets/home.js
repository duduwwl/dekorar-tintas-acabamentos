/* Dekorar — interações da landing page (sem dependências) */
(() => {
  'use strict';
  const doc = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- Header, progresso e parallax do hero ---------- */
  const header = $('[data-header]');
  const progress = $('.progress');
  const heroImg = $('.hero-img');
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 8);
    const max = doc.scrollHeight - window.innerHeight;
    progress?.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (heroImg && !reduce.matches && y < window.innerHeight * 1.2) {
      heroImg.style.setProperty('--py', `${(y * 0.12).toFixed(1)}px`);
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Menu móvel ---------- */
  const toggle = $('.menu-toggle');
  const menu = $('#menu');
  const setMenu = open => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle-label').textContent = open ? 'Fechar' : 'Menu';
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) menu.querySelector('a')?.focus({ preventScroll: true });
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1101px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------- Seção ativa na navegação ---------- */
  const navLinks = $$('[data-nav]');
  if ('IntersectionObserver' in window && navLinks.length) {
    const map = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(a => a.removeAttribute('aria-current'));
        map.get(entry.target.id)?.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
    const hero = document.getElementById('inicio');
    if (hero) new IntersectionObserver(([e]) => { if (e.isIntersecting) navLinks.forEach(a => a.removeAttribute('aria-current')); }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
  }

  /* ---------- Entradas por seção (escalonadas) ---------- */
  $$('main > section, .site-footer').forEach(section => {
    $$('[data-rise], [data-reveal-img]', section).forEach((el, i) => el.style.setProperty('--d', `${i * 80}ms`));
  });
  $$('[data-stagger]').forEach(list => {
    const items = list.matches('table') ? $$('tbody > tr', list) : [...list.children];
    items.forEach((el, i) => el.style.setProperty('--d', `${120 + i * 70}ms`));
  });

  const counters = $$('[data-count]');
  const runCounter = el => {
    const target = Number(el.dataset.count);
    const fmt = new Intl.NumberFormat('pt-BR');
    if (reduce.matches) { el.textContent = fmt.format(target); return; }
    const start = performance.now(), dur = 1400;
    const step = now => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = fmt.format(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const revealTargets = $$('[data-rise], [data-stagger], [data-reveal-img], .curtain-panel, .entrega-fact');
  if ('IntersectionObserver' in window && !reduce.matches) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add(el.classList.contains('curtain-panel') ? 'is-in' : 'in');
        $$('[data-count]', el).forEach(runCounter);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealTargets.forEach(el => io.observe(el));
    $$('.hero [data-rise]').forEach(el => el.classList.add('in'));
  } else {
    revealTargets.forEach(el => el.classList.add('in', 'is-in'));
    counters.forEach(el => { el.textContent = new Intl.NumberFormat('pt-BR').format(Number(el.dataset.count)); });
  }

  /* ---------- Botões magnéticos (só mouse) ---------- */
  if (finePointer.matches && !reduce.matches) {
    $$('[data-magnetic]').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 8;
        btn.style.setProperty('--mx', `${x.toFixed(1)}px`);
        btn.style.setProperty('--my', `${y.toFixed(1)}px`);
      });
      btn.addEventListener('pointerleave', () => { btn.style.setProperty('--mx', '0px'); btn.style.setProperty('--my', '0px'); });
    });
  }

  /* ---------- Monte o pedido (mensagem do WhatsApp) ---------- */
  const form = $('[data-builder]');
  if (form) {
    const preview = $('[data-preview]', form);
    const hidden = $('[data-text]', form);
    const box = $('.preview', form);
    const compose = () => {
      const etapas = $$('input[name="etapa"]:checked', form).map(i => i.value.toLowerCase());
      const loja = $('input[name="loja"]:checked', form)?.value || 'Lavras';
      const receber = $('input[name="receber"]:checked', form)?.value;
      const detalhes = $('textarea[name="detalhes"]', form).value.trim();
      const lines = ['Olá, vim pelo site da Dekorar e quero um orçamento.'];
      if (etapas.length) {
        const list = etapas.length > 1 ? `${etapas.slice(0, -1).join(', ')} e ${etapas.at(-1)}` : etapas[0];
        lines.push(`Etapa da obra: ${list}.`);
      }
      lines.push(`Loja: ${loja}.`);
      lines.push(receber === 'retirada' ? `Vou retirar na loja de ${loja}.` : 'Preciso de entrega na obra.');
      if (detalhes) lines.push(`Detalhes: ${detalhes}`);
      return lines.join('\n');
    };
    const update = () => {
      const text = compose();
      preview.textContent = text;
      hidden.value = text;
      if (!reduce.matches) { box.classList.remove('is-updated'); void box.offsetWidth; box.classList.add('is-updated'); }
    };
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const url = `https://wa.me/5535984336650?text=${encodeURIComponent(compose())}`;
      const win = window.open(url, '_blank', 'noopener');
      if (!win) window.location.href = url;
    });
    update();
  }

  /* ---------- Galeria ampliada ---------- */
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
    ['totem-noite', 'Totem da loja de Lavras à noite, com as marcas da casa.'],
  ];
  const lb = $('[data-lightbox]');
  if (lb && typeof lb.showModal === 'function') {
    const img = $('[data-lightbox-img]', lb);
    const cap = $('[data-lightbox-cap]', lb);
    const count = $('[data-lightbox-count]', lb);
    let index = 0, opener = null;
    const show = i => {
      index = (i + photos.length) % photos.length;
      const [name, text] = photos[index];
      img.classList.remove('is-swapping'); void img.offsetWidth; img.classList.add('is-swapping');
      img.src = `assets/img/${name}-lg.webp`;
      img.alt = text;
      cap.textContent = text;
      count.textContent = `${index + 1} / ${photos.length}`;
      new Image().src = `assets/img/${photos[(index + 1) % photos.length][0]}-lg.webp`;
    };
    $$('[data-gallery-open]').forEach(btn => btn.addEventListener('click', () => {
      opener = btn;
      show(Number(btn.dataset.galleryOpen) || 0);
      lb.showModal();
      $('[data-lightbox-close]', lb).focus();
    }));
    $('[data-lightbox-prev]', lb).addEventListener('click', () => show(index - 1));
    $('[data-lightbox-next]', lb).addEventListener('click', () => show(index + 1));
    $('[data-lightbox-close]', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('close', () => opener?.focus());
    lb.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'ArrowLeft') show(index - 1);
    });
    lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lightbox-figure')) lb.close(); });
    let sx = null;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      sx = null;
    });
  } else {
    $$('[data-gallery-open]').forEach(btn => { btn.hidden = btn.classList.contains('galeria-open'); });
  }

  /* ---------- Ano ---------- */
  $$('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
})();
