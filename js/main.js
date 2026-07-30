/**
 * Single entry point loaded (as a native ES module) on every page. Site-wide
 * behavior initializes unconditionally; page-specific modules check for
 * their own DOM hooks internally and simply no-op when absent, so this one
 * script tag is all any page needs — see docs/phase-10-javascript-features.md
 * for why that's the chosen pattern over per-page script tags.
 */
import { initPreloader } from './modules/preloader.js';
import { initTheme } from './modules/theme.js';
import { initNavigation } from './modules/navigation.js';
import { initTabs } from './modules/tabs.js';
import { initScrollChrome } from './modules/scroll-chrome.js';
import { initCart } from './modules/cart.js';
import { initWishlist } from './modules/wishlist.js';
import { initShopFilter } from './modules/shop-filter.js';
import { initPdp } from './modules/pdp.js';
import { initCheckout } from './modules/checkout.js';
import { initSearch } from './modules/search.js';
import { initForms, initNewsletterForms } from './modules/forms.js';

function setCurrentYear() {
  document.querySelectorAll('[data-current-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    targets.forEach((el) => el.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  targets.forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  setCurrentYear();
  initPreloader();
  initTheme();
  initNavigation();
  initTabs();
  initScrollChrome();
  initScrollReveal();
  initForms();
  initNewsletterForms();
  initCart();
  initWishlist();
  initShopFilter();
  initPdp();
  initCheckout();
  initSearch();
});
