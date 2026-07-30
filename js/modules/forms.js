/**
 * Contact, Custom Orders, and bulk-inquiry (Wedding/Corporate) form
 * submission: validation, spam prevention, Google Sheets logging, EmailJS
 * notification, and a WhatsApp continuation. See
 * docs/phase-11-forms-integration.md for the setup steps this depends on.
 */
import { INTEGRATIONS_CONFIG, isConfigured } from '../config.js';

const MIN_SECONDS_BEFORE_SUBMIT = 3;
const RESUBMIT_COOLDOWN_MS = 30_000;
let emailjsLoaded = false;

async function ensureEmailJsLoaded() {
  if (emailjsLoaded || window.emailjs) {
    emailjsLoaded = true;
    return;
  }
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  window.emailjs.init({ publicKey: INTEGRATIONS_CONFIG.emailjs.publicKey });
  emailjsLoaded = true;
}

function showFieldError(field, message) {
  const wrapper = field.closest('.form-field') || field.parentElement;
  wrapper.classList.add('form-field--error');
  let msg = wrapper.querySelector('.form-error-msg');
  if (!msg) {
    msg = document.createElement('div');
    msg.className = 'form-error-msg';
    wrapper.appendChild(msg);
  }
  msg.innerHTML = `<i class="bi bi-exclamation-circle" aria-hidden="true"></i> ${message}`;
}

function clearFieldError(field) {
  const wrapper = field.closest('.form-field') || field.parentElement;
  wrapper.classList.remove('form-field--error');
  wrapper.querySelector('.form-error-msg')?.remove();
}

function validateForm(form) {
  let firstInvalid = null;
  const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
  fields.forEach((field) => {
    if (field.checkValidity()) {
      clearFieldError(field);
    } else {
      showFieldError(field, field.validationMessage);
      if (!firstInvalid) firstInvalid = field;
    }
  });
  fields.forEach((field) => {
    field.addEventListener(
      'input',
      () => {
        if (field.checkValidity()) clearFieldError(field);
      },
      { once: false }
    );
  });
  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

function isHoneypotTripped(form) {
  const honeypot = form.querySelector('.form-honeypot');
  return Boolean(honeypot && honeypot.value.trim().length > 0);
}

function isTooFast(loadedAt) {
  return (Date.now() - loadedAt) / 1000 < MIN_SECONDS_BEFORE_SUBMIT;
}

function isRateLimited(formType) {
  const key = `ya-last-submit-${formType}`;
  const last = Number(localStorage.getItem(key) || 0);
  return Date.now() - last < RESUBMIT_COOLDOWN_MS;
}
function markSubmitted(formType) {
  localStorage.setItem(`ya-last-submit-${formType}`, String(Date.now()));
}

function formDataToObject(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    if (!form.querySelector(`[name="${key}"]`)?.classList.contains('form-honeypot')) {
      data[key] = value;
    }
  });
  return data;
}

async function submitToGoogleSheets(formType, data) {
  if (!isConfigured(INTEGRATIONS_CONFIG.googleSheets.webAppUrl)) {
    console.info(`[forms] Google Sheets not configured yet — skipping log for "${formType}". See docs/phase-11-forms-integration.md.`);
    return;
  }
  try {
    await fetch(INTEGRATIONS_CONFIG.googleSheets.webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ formType, ...data }),
    });
  } catch (err) {
    console.warn('[forms] Google Sheets logging failed:', err);
  }
}

/**
 * One shared EmailJS template handles every form type (see setup steps in
 * docs/phase-11-forms-integration.md) by using just two merge fields —
 * {{form_type}} and {{summary}} — instead of a different field set per
 * form. `summary` is a pre-formatted, human-readable dump of whatever
 * fields that particular form collected.
 */
function buildSummary(data) {
  return Object.entries(data)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

async function submitViaEmailJs(formType, data) {
  if (!isConfigured(INTEGRATIONS_CONFIG.emailjs.publicKey) || !isConfigured(INTEGRATIONS_CONFIG.emailjs.serviceId) || !isConfigured(INTEGRATIONS_CONFIG.emailjs.templateId)) {
    console.info(`[forms] EmailJS not configured yet — skipping email notification for "${formType}". See docs/phase-11-forms-integration.md.`);
    return;
  }
  try {
    await ensureEmailJsLoaded();
    await window.emailjs.send(INTEGRATIONS_CONFIG.emailjs.serviceId, INTEGRATIONS_CONFIG.emailjs.templateId, {
      form_type: formType,
      summary: buildSummary(data),
    });
  } catch (err) {
    console.warn('[forms] EmailJS send failed:', err);
  }
}

function buildWhatsAppLink(formType, data) {
  const lines = [`New ${formType} submission from the website:`];
  Object.entries(data).forEach(([key, value]) => {
    if (value) lines.push(`${key}: ${value}`);
  });
  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${INTEGRATIONS_CONFIG.whatsapp.businessNumber}?text=${text}`;
}

function showSuccessUI(form, formType, data, { mentionPhotos = false } = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-success-panel';
  wrapper.setAttribute('role', 'status');
  wrapper.innerHTML = `
    <i class="bi bi-check-circle" aria-hidden="true"></i>
    <h3>Thanks — we've got it.</h3>
    <p>We'll get back to you within 1 business day.</p>
    ${mentionPhotos ? '<p class="text-muted" style="font-size:.85rem;">If you attached a photo above, sending it once more over WhatsApp guarantees we receive it clearly.</p>' : ''}
    <a class="btn btn-outline" href="${buildWhatsAppLink(formType, data)}" target="_blank" rel="noopener">
      <i class="bi bi-whatsapp" aria-hidden="true"></i> Also send us a WhatsApp message
    </a>
  `;
  form.replaceWith(wrapper);
}

/**
 * Wires one form. `formType` becomes both the Google Sheet tab name and the
 * EmailJS `form_type` template variable.
 */
function initForm(formId, formType, options = {}) {
  const form = document.getElementById(formId);
  if (!form) return;

  const loadedAt = Date.now();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isHoneypotTripped(form) || isTooFast(loadedAt)) {
      // Silently pretend success — don't tip off whatever filled the form in.
      showSuccessUI(form, formType, {}, options);
      return;
    }
    if (!validateForm(form)) return;

    if (isRateLimited(formType)) {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        const original = submitBtn.textContent;
        submitBtn.textContent = "You've already sent this — we've got it!";
        window.setTimeout(() => (submitBtn.textContent = original), 3000);
      }
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    const data = formDataToObject(form);
    await Promise.allSettled([submitToGoogleSheets(formType, data), submitViaEmailJs(formType, data)]);
    markSubmitted(formType);
    showSuccessUI(form, formType, data, options);
  });
}

export function initForms() {
  initForm('contactForm', 'Contact');
  initForm('customOrderForm', 'CustomOrder', { mentionPhotos: true });
  initForm('weddingInquiryForm', 'WeddingInquiry');
  initForm('corporateInquiryForm', 'CorporateInquiry');
}

/**
 * Newsletter forms are small, repeated inline widgets (homepage, footer on
 * every page, the festival-gifting page) rather than one unique form per
 * page, so they get their own lightweight wiring: a button-label flip
 * instead of the full success-panel treatment used above.
 */
export function initNewsletterForms() {
  document.querySelectorAll('[data-newsletter-form]').forEach((form) => {
    const loadedAt = Date.now();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (isHoneypotTripped(form) || isTooFast(loadedAt)) {
        if (btn) flashLabel(btn, 'Subscribed ✓');
        form.reset();
        return;
      }
      const email = form.querySelector('input[type="email"]')?.value;
      if (!email) return;
      if (btn) btn.disabled = true;
      await Promise.allSettled([submitToGoogleSheets('Newsletter', { email }), submitViaEmailJs('Newsletter', { email })]);
      if (btn) flashLabel(btn, 'Subscribed ✓');
      form.reset();
    });
  });
}

function flashLabel(btn, tempLabel) {
  const original = btn.textContent;
  btn.textContent = tempLabel;
  window.setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, 2500);
}
