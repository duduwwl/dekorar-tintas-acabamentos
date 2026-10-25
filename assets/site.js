const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuButton?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
navLinks?.addEventListener('click', event => {
  if (event.target.closest('a')) { navLinks.classList.remove('open'); menuButton?.setAttribute('aria-expanded', 'false'); }
});
document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
document.querySelectorAll('[data-year]').forEach(element => {
  element.textContent = new Intl.DateTimeFormat('pt-BR', { year: 'numeric' }).format(new Date());
});
