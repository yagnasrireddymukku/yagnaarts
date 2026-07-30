/**
 * Product Detail Page behavior: thumbnail gallery swap, quantity stepper,
 * the mobile sticky buy bar, and Recently Viewed (localStorage-tracked).
 */
import { getProductsByIds, productCardHTML } from './product-data.js';
import { syncHeartIcons } from './wishlist.js';

const RECENTLY_VIEWED_KEY = 'ya-recently-viewed';
const MAX_RECENTLY_VIEWED = 8;

function initGallery() {
  const mainImage = document.getElementById('pdpMainImage');
  const thumbs = document.querySelectorAll('.pdp-thumb');
  if (!mainImage || !thumbs.length) return;

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      mainImage.src = thumb.dataset.image;
      thumbs.forEach((t) => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
    });
    if (index === 0) thumb.classList.add('is-active');
  });
}

function initQtyStepper() {
  const input = document.getElementById('pdpQty');
  if (!input) return;
  const row = input.closest('.qty-stepper');
  row.querySelector('button:first-child')?.addEventListener('click', () => {
    input.value = Math.max(1, parseInt(input.value, 10) - 1);
  });
  row.querySelector('button:last-child')?.addEventListener('click', () => {
    input.value = parseInt(input.value, 10) + 1;
  });
}

function initStickyBar() {
  const ctaRow = document.querySelector('.pdp-cta-row');
  const stickyBar = document.querySelector('[data-pdp-sticky-bar]');
  if (!ctaRow || !stickyBar) return;

  const observer = new IntersectionObserver(
    ([entry]) => stickyBar.classList.toggle('is-visible', !entry.isIntersecting),
    { rootMargin: '-80px 0px 0px 0px' }
  );
  observer.observe(ctaRow);
}

function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY)) || [];
  } catch {
    return [];
  }
}

async function initRecentlyViewed() {
  const main = document.querySelector('[data-current-product-id]');
  const section = document.querySelector('[data-recently-viewed]');
  const list = document.querySelector('[data-recently-viewed-list]');
  if (!main) return;

  const currentId = main.dataset.currentProductId;
  let viewed = getRecentlyViewed().filter((id) => id !== currentId);

  // Render OTHER previously-viewed products before recording this one.
  if (section && list && viewed.length > 0) {
    const products = await getProductsByIds(viewed.slice(0, MAX_RECENTLY_VIEWED));
    if (products.length > 0) {
      list.innerHTML = products.map(productCardHTML).join('');
      section.hidden = false;
      syncHeartIcons();
    }
  }

  viewed.unshift(currentId);
  viewed = viewed.slice(0, MAX_RECENTLY_VIEWED);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(viewed));
}

export function initPdp() {
  initGallery();
  initQtyStepper();
  initStickyBar();
  initRecentlyViewed();
}
