const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuButton?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
navLinks?.addEventListener('click', event => {
  if (event.target.closest('a')) { navLinks.classList.remove('open'); menuButton?.setAttribute('aria-expanded','false'); }
});
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
} else document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));

if (!reducedMotion && 'IntersectionObserver' in window) {
  const ignoredText = 'script,style,noscript,svg,[aria-hidden="true"],.visually-hidden,.text-effect-word';
  const wordObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      wordObserver.unobserve(entry.target);
    }
  }), { threshold: .08, rootMargin: '0px 0px -3% 0px' });

  const wrapTextNode = textNode => {
    const value = textNode.nodeValue;
    if (!value || !/[\p{L}\p{N}]/u.test(value) || textNode.parentElement?.closest(ignoredText)) return;
    const fragment = document.createDocumentFragment();
    for (const part of value.split(/(\s+)/u)) {
      if (!part) continue;
      if (/^\s+$/u.test(part)) {
        fragment.append(document.createTextNode(part));
        continue;
      }
      const word = document.createElement('span');
      word.className = 'text-effect-word';
      Array.from(part).forEach((character,index) => {
        const letter = document.createElement('span');
        letter.className = 'text-effect-char';
        letter.style.setProperty('--char-index', index);
        letter.textContent = character;
        word.append(letter);
      });
      fragment.append(word);
    }
    textNode.replaceWith(fragment);
  };

  const prepareText = root => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(wrapTextNode);
    const selector = '.text-effect-word:not(.is-visible)';
    const words = [...(root.matches?.(selector) ? [root] : []), ...(root.querySelectorAll?.(selector) || [])];
    words.forEach(word => wordObserver.observe(word));
  };

  prepareText(document.body);
  document.body.classList.add('text-motion-ready');
  const textMutations = new MutationObserver(records => records.forEach(record => {
    if (record.type === 'characterData') wrapTextNode(record.target);
    record.addedNodes?.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) wrapTextNode(node);
      else if (node.nodeType === Node.ELEMENT_NODE && !node.closest?.(ignoredText)) prepareText(node);
    });
  }));
  textMutations.observe(document.body,{subtree:true,childList:true,characterData:true});
}
document.querySelectorAll('[data-year]').forEach(element => {
  element.textContent = new Intl.DateTimeFormat('pt-BR',{year:'numeric'}).format(new Date());
});
