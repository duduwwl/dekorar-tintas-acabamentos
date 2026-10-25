/* Dekorar — interações da landing page (sem dependências) */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Header: fundo branco depois de rolar */
  const header = $('[data-header]');
  let ticking = false;
  const onScroll = () => { header?.classList.toggle('is-scrolled', window.scrollY > 8); ticking = false; };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* Menu no celular e tablet */
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
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1181px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* Seção atual na navegação */
  const navLinks = $$('[data-nav]');
  if ('IntersectionObserver' in window && navLinks.length) {
    const byId = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.removeAttribute('aria-current'));
      byId.get(entry.target.id)?.setAttribute('aria-current', 'true');
    }), { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
    const top = document.getElementById('inicio');
    if (top) new IntersectionObserver(([e]) => { if (e.isIntersecting) navLinks.forEach(a => a.removeAttribute('aria-current')); }, { rootMargin: '-45% 0px -50% 0px' }).observe(top);
  }

  /* Ficha de pedido: monta a mensagem do WhatsApp */
  const form = $('[data-builder]');
  if (form) {
    const preview = $('[data-preview]', form);
    const hidden = $('[data-text]', form);
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
    const update = () => { const t = compose(); preview.textContent = t; hidden.value = t; };
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

  /* Galeria ampliada */
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
    const src = (name, size = 'md') => `assets/img/${name}-${size}.webp`;
    const show = i => {
      index = (i + photos.length) % photos.length;
      const [name, text] = photos[index];
      if (!reduce.matches) { img.classList.remove('is-swapping'); void img.offsetWidth; img.classList.add('is-swapping'); }
      img.src = src(name, window.innerWidth > 1100 ? 'lg' : 'md');
      img.alt = text;
      cap.textContent = text;
      count.textContent = `Foto ${index + 1} de ${photos.length}`;
      new Image().src = src(photos[(index + 1) % photos.length][0], window.innerWidth > 1100 ? 'lg' : 'md');
    };
    $$('[data-gallery-open]').forEach(btn => btn.addEventListener('click', () => {
      opener = btn;
      show(Number(btn.dataset.galleryOpen) || 0);
      lb.showModal();
      $('[data-lightbox-next]', lb).focus();
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
    $$('[data-gallery-open]').forEach(btn => { btn.hidden = true; });
  }

  $$('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
})();
