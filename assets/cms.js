/* Dekorar — textos e cores editáveis pela área da equipe.
   Lê a linha "home" de site_settings e aplica nos elementos com data-cms
   e nos tokens de cor do tema. Sem configuração salva, o site fica como está no HTML. */
(() => {
  'use strict';
  const CACHE = 'dekorar-site-cfg';
  const COLORS = { laranja: '--orange', escuro: '--ink', fundo: '--paper' };
  const isHex = v => /^#[0-9a-f]{6}$/i.test(String(v || ''));

  function applyColors(cfg) {
    const cores = cfg.cores || {};
    Object.entries(COLORS).forEach(([chave, token]) => {
      if (isHex(cores[chave])) document.documentElement.style.setProperty(token, cores[chave]);
    });
  }

  function applyTexts(cfg) {
    const textos = cfg.textos || {};
    document.querySelectorAll('[data-cms]').forEach(el => {
      const novo = textos[el.dataset.cms];
      if (typeof novo !== 'string' || !novo.trim()) return;
      el.textContent = novo;
      // o título pode já ter sido fatiado em palavras pela animação: volta a ser texto simples
      el.classList.remove('rv-words');
      el.style.opacity = '1';
      el.style.filter = 'none';
      el.style.transform = 'none';
      if (el.dataset.countTo) {
        const n = novo.replace(/\D/g, '');
        if (n) el.dataset.countTo = n;
      }
    });
  }

  function apply(cfg) {
    if (!cfg || typeof cfg !== 'object') return;
    applyColors(cfg);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => applyTexts(cfg), { once: true });
    else applyTexts(cfg);
  }

  // 1) o que já foi visto neste navegador entra na hora, para não piscar
  try { apply(JSON.parse(localStorage.getItem(CACHE) || 'null')); } catch { /* sem cache */ }

  // 2) depois busca o que está salvo no banco
  let tentativas = 0;
  (function esperaDB() {
    const db = window.DekorarDB;
    if (!db || !db.getSettings) {
      if (tentativas++ > 60) return;
      setTimeout(esperaDB, 50);
      return;
    }
    db.getSettings().then(cfg => {
      apply(cfg);
      try { localStorage.setItem(CACHE, JSON.stringify(cfg || {})); } catch { /* sem armazenamento */ }
    }).catch(() => { /* site segue com o conteúdo do HTML */ });
  })();
})();
