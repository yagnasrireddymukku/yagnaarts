/**
 * LocalStorage-backed wishlist. Same rationale as cart.js — client-side
 * until a real backend/account system exists.
 */
import { getProductsByIds, productCardHTML } from './product-data.js';

const WISHLIST_KEY = 'ya-wishlist';

export function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  } catch {
    return [];
  }
}

function saveWishlist(ids) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  updateWishlistBadge();
}

export function isWishlisted(productId) {
  return getWishlist().includes(productId);
}

export function toggleWishlist(productId) {
  const ids = getWishlist();
  const idx = ids.indexOf(productId);
  if (idx === -1) ids.push(productId);
  else ids.splice(idx, 1);
  saveWishlist(ids);
  return idx === -1; // true if it was just added
}

export function updateWishlistBadge() {
  const count = getWishlist().length;
  document.querySelectorAll('[data-wishlist-count]').forEach((badge) => {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
}

export function syncHeartIcons() {
  const ids = getWishlist();
  document.querySelectorAll('[data-wishlist-toggle]').forEach((btn) => {
    const active = ids.includes(btn.dataset.productId);
    btn.classList.toggle('is-active', active);
  });
}

async function renderWishlistPage() {
  const emptyState = document.querySelector('[data-wishlist-empty-state]');
  const grid = document.querySelector('[data-wishlist-items]');
  if (!emptyState || !grid) return;

  const ids = getWishlist();
  if (ids.length === 0) {
    emptyState.hidden = false;
    grid.hidden = true;
    return;
  }
  emptyState.hidden = true;
  grid.hidden = false;
  const products = await getProductsByIds(ids);
  grid.innerHTML = products.map(productCardHTML).join('');
  syncHeartIcons();
}

function initWishlistActions() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-wishlist-toggle]');
    if (!btn) return;
    e.preventDefault();
    const justAdded = toggleWishlist(btn.dataset.productId);
    btn.classList.toggle('is-active', justAdded);
    if (document.querySelector('[data-wishlist-items]')) renderWishlistPage();
  });
}

export function initWishlist() {
  updateWishlistBadge();
  syncHeartIcons();
  initWishlistActions();
  if (document.querySelector('[data-wishlist-items]')) renderWishlistPage();
}
