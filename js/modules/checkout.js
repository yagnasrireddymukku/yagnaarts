/**
 * Checkout step navigation + order placement. No payment gateway exists
 * yet (see the payment note baked into checkout.html) — "placing an order"
 * here means: validate the form, clear the cart, generate a reference
 * number, and hand off to the confirmation page. Phase 11 will point the
 * same submit handler at a real Google Sheets/EmailJS notification.
 */
import { clearCart } from './cart.js';

function goToStep(stepNumber) {
  document.querySelectorAll('.checkout-step-panel').forEach((panel) => {
    panel.classList.toggle('is-active', panel.dataset.stepPanel === String(stepNumber));
  });
  document.querySelectorAll('.checkout-stepper__step').forEach((step) => {
    const n = Number(step.dataset.stepIndicator);
    step.classList.toggle('is-active', n === stepNumber);
    step.classList.toggle('is-complete', n < stepNumber);
  });
  document.querySelector('.checkout-layout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initStepNav() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  document.querySelectorAll('[data-checkout-next]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = btn.closest('.checkout-step-panel');
      const inputs = panel.querySelectorAll('input[required], select[required], textarea[required]');
      for (const input of inputs) {
        if (!input.reportValidity()) return;
      }
      goToStep(Number(btn.dataset.checkoutNext));
    });
  });

  document.querySelectorAll('[data-checkout-back]').forEach((btn) => {
    btn.addEventListener('click', () => goToStep(Number(btn.dataset.checkoutBack)));
  });
}

function generateOrderNumber() {
  return 'YA-' + Date.now().toString().slice(-6);
}

function initSubmit() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const orderNumber = generateOrderNumber();
    sessionStorage.setItem('ya-last-order', orderNumber);
    clearCart();
    window.location.href = '/pages/checkout-confirmation.html';
  });
}

function initConfirmationPage() {
  const el = document.querySelector('[data-order-number]');
  if (!el) return;
  const orderNumber = sessionStorage.getItem('ya-last-order');
  if (orderNumber) el.textContent = `Order #${orderNumber}`;
}

export function initCheckout() {
  initStepNav();
  initSubmit();
  initConfirmationPage();
}
