(() => {
  'use strict';
  const form = document.querySelector('[data-nav-search]');
  if (!form) return;

  const input = form.querySelector('[data-nav-search-input]');
  const toggle = form.querySelector('[data-nav-search-toggle]');
  const header = form.closest('[data-header]');

  const setOpen = open => {
    form.classList.toggle('is-open', open);
    header?.classList.toggle('search-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    input.tabIndex = open ? 0 : -1;
    if (open) requestAnimationFrame(() => input.focus());
  };

  toggle.addEventListener('click', () => {
    if (form.classList.contains('is-open') && input.value.trim()) {
      form.requestSubmit();
      return;
    }
    setOpen(!form.classList.contains('is-open'));
  });

  form.addEventListener('submit', event => {
    if (!input.value.trim()) {
      event.preventDefault();
      setOpen(true);
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && form.classList.contains('is-open')) {
      input.value = '';
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', event => {
    if (!form.contains(event.target) && !input.value.trim()) setOpen(false);
  });
})();
