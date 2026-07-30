/**
 * Sticky nav interactions: mobile menu (with focus trap + Escape-to-close),
 * mega-menu click/keyboard toggling (CSS already handles :hover), and the
 * search overlay.
 */

function trapFocus(container, onEscape) {
  const focusable = container.querySelectorAll(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return () => {};
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      onEscape();
      return;
    }
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', handleKeydown);
  first.focus();
  return () => container.removeEventListener('keydown', handleKeydown);
}

function initMobileMenu() {
  const toggle = document.getElementById('mobileMenuToggle');
  const menu = document.getElementById('mobileMenu');
  const backdrop = document.getElementById('mobileMenuBackdrop');
  const closeBtn = document.getElementById('mobileMenuClose');
  if (!toggle || !menu || !backdrop) return;

  let releaseFocusTrap = null;

  function open() {
    menu.hidden = false;
    backdrop.hidden = false;
    // Force layout before adding the transition-triggering class.
    requestAnimationFrame(() => {
      menu.classList.add('is-open');
      backdrop.classList.add('is-open');
    });
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    releaseFocusTrap = trapFocus(menu, close);
  }

  function close() {
    menu.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (releaseFocusTrap) releaseFocusTrap();
    window.setTimeout(() => {
      menu.hidden = true;
      backdrop.hidden = true;
    }, 350); // matches --duration-slow
    toggle.focus();
  }

  toggle.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  backdrop.addEventListener('click', close);
}

function initMegaMenus() {
  const megaItems = document.querySelectorAll('.has-mega');
  megaItems.forEach((item) => {
    const trigger = item.querySelector('.nav-link-btn');
    if (!trigger) return;
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      megaItems.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.nav-link-btn')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', (e) => {
    megaItems.forEach((item) => {
      if (!item.contains(e.target)) {
        item.classList.remove('is-open');
        item.querySelector('.nav-link-btn')?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      megaItems.forEach((item) => item.classList.remove('is-open'));
    }
  });
}

function initSearchOverlay() {
  const toggle = document.getElementById('searchToggle');
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('siteSearchInput');
  if (!toggle || !overlay) return;

  toggle.addEventListener('click', () => {
    const isHidden = overlay.hidden;
    overlay.hidden = !isHidden;
    toggle.setAttribute('aria-expanded', String(isHidden));
    if (isHidden) input?.focus();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) {
      overlay.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

export function initNavigation() {
  initMobileMenu();
  initMegaMenus();
  initSearchOverlay();
}
