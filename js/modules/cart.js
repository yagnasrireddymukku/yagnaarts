/**
 * LocalStorage-backed cart. No backend exists yet (see docs/phase-1 future
 * roadmap), so the cart itself, its badge count, and its rendering on
 * cart.html/checkout.html are all client-side for now — swappable for a
 * real backend cart later without changing any markup, since every element
 * this module touches is addressed via data-* attributes, not IDs tied to
 * a specific implementation.
 */
import { getProductsByIds } from './product-data.js';

const CART_KEY = 'ya-cart';
const SHIPPING_FLAT = 99;
const FREE_SHIPPING_THRESHOLD = 2500;

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

export function addToCart(productId, qty = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.productId === productId);
  if (existing) existing.qty += qty;
  else cart.push({ productId, qty });
  saveCart(cart);
}

export function removeFromCart(productId) {
  saveCart(getCart().filter((item) => item.productId !== productId));
}

export function updateQty(productId, qty) {
  const cart = getCart();
  const item = cart.find((i) => i.productId === productId);
  if (!item) return;
  item.qty = Math.max(1, qty);
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

export async function computeTotals() {
  const cart = getCart();
  const products = await getProductsByIds(cart.map((i) => i.productId));
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return product ? sum + product.price * item.qty : sum;
  }, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  return { subtotal, shipping, total: subtotal + shipping };
}

export function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('[data-cart-count]').forEach((badge) => {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
}

async function renderCartPage() {
  const populated = document.querySelector('[data-cart-populated]');
  const emptyState = document.querySelector('[data-cart-empty-state]');
  const itemsContainer = document.querySelector('[data-cart-items]');
  if (!populated || !emptyState || !itemsContainer) return;

  const cart = getCart();
  if (cart.length === 0) {
    populated.hidden = true;
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;
  populated.hidden = false;

  const products = await getProductsByIds(cart.map((i) => i.productId));
  itemsContainer.innerHTML = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return '';
      return `
        <div class="cart-item" data-cart-item="${product.id}">
          <img src="${product.images[0]}" alt="${product.name}">
          <div>
            <div class="cart-item__name">${product.name}</div>
            <div class="cart-item__actions">
              <div class="qty-stepper">
                <button type="button" data-qty-decrease aria-label="Decrease quantity">&minus;</button>
                <input type="number" value="${item.qty}" min="1" data-qty-input aria-label="Quantity">
                <button type="button" data-qty-increase aria-label="Increase quantity">+</button>
              </div>
              <button class="cart-item__remove" type="button" data-remove-item>Remove</button>
            </div>
          </div>
          <div class="cart-item__price">&#8377;${product.price * item.qty}</div>
        </div>`;
    })
    .join('');

  await updateSummary();
}

async function updateSummary() {
  const { subtotal, shipping, total } = await computeTotals();
  document.querySelectorAll('[data-cart-subtotal]').forEach((el) => (el.textContent = `₹${subtotal}`));
  document.querySelectorAll('[data-cart-shipping]').forEach((el) => (el.textContent = shipping === 0 ? 'Free' : `₹${shipping}`));
  document.querySelectorAll('[data-cart-total]').forEach((el) => (el.textContent = `₹${total}`));

  const summaryList = document.querySelector('[data-checkout-summary-items]');
  if (summaryList) {
    const cart = getCart();
    const products = await getProductsByIds(cart.map((i) => i.productId));
    summaryList.innerHTML = cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return '';
        return `<div class="checkout-summary-item"><span>${product.name} &times;${item.qty}</span><span>&#8377;${product.price * item.qty}</span></div>`;
      })
      .join('');
  }
}

function flashButtonLabel(btn, tempLabel) {
  const original = btn.textContent;
  btn.textContent = tempLabel;
  btn.disabled = true;
  window.setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, 1400);
}

function initCartActions() {
  document.addEventListener('click', async (e) => {
    const addBtn = e.target.closest('[data-add-to-cart]');
    if (addBtn) {
      const qtyInput = document.getElementById('pdpQty');
      const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;
      addToCart(addBtn.dataset.productId, qty);
      flashButtonLabel(addBtn, 'Added ✓');
      if (document.querySelector('[data-cart-populated]')) renderCartPage();
      return;
    }

    const buyBtn = e.target.closest('[data-buy-now]');
    if (buyBtn) {
      const qtyInput = document.getElementById('pdpQty');
      const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;
      addToCart(buyBtn.dataset.productId, qty);
      window.location.href = '/pages/checkout.html';
      return;
    }

    const removeBtn = e.target.closest('[data-remove-item]');
    if (removeBtn) {
      const row = removeBtn.closest('[data-cart-item]');
      removeFromCart(row.dataset.cartItem);
      renderCartPage();
      return;
    }

    const decBtn = e.target.closest('[data-qty-decrease]');
    const incBtn = e.target.closest('[data-qty-increase]');
    if (decBtn || incBtn) {
      const row = (decBtn || incBtn).closest('[data-cart-item]');
      const input = row.querySelector('[data-qty-input]');
      const next = parseInt(input.value, 10) + (incBtn ? 1 : -1);
      if (next < 1) return;
      updateQty(row.dataset.cartItem, next);
      renderCartPage();
    }
  });

  document.addEventListener('change', (e) => {
    const input = e.target.closest('[data-qty-input]');
    if (!input) return;
    const row = input.closest('[data-cart-item]');
    updateQty(row.dataset.cartItem, parseInt(input.value, 10) || 1);
    renderCartPage();
  });
}

export function initCart() {
  updateCartBadge();
  initCartActions();
  if (document.querySelector('[data-cart-populated]')) renderCartPage();
  if (document.querySelector('[data-checkout-summary-items]')) updateSummary();
}

export { updateSummary as updateCartSummary };

