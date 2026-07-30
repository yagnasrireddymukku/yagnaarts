# YagnaArts — Phase 11: Forms Integration

**Builds on:** [Phase 9](phase-9-remaining-pages.md) (form markup), [Phase 10](phase-10-javascript-features.md) (JS architecture)
**Status:** Implemented — code is real and complete; two external accounts still need YOUR credentials

---

## 1. What's wired up

`js/modules/forms.js` handles all four lead-capture forms (Contact, Custom Orders, Wedding Inquiry, Corporate Inquiry) plus every Newsletter form on the site, with one shared pipeline per submission:

1. **Spam check** — a honeypot field (already in every form's markup, invisible to humans, present in the tab order for bots) and a time-trap (rejects submissions faster than 3 seconds after the page loaded — real users can't fill a form that fast). Both fail silently with a fake success, so a bot never learns what tripped it.
2. **Validation** — every required field is checked with the native Constraint Validation API; invalid fields get a visible inline error (reusing the `.form-field--error`/`.form-error-msg` styles built in Phase 9) and focus moves to the first problem field.
3. **Rate limiting** — a `localStorage` timestamp per form type blocks accidental resubmission within 30 seconds.
4. **Google Sheets logging** (fire-and-forget) and **EmailJS notification** run in parallel via `Promise.allSettled` — neither blocks the other, and both fail gracefully (silently, with a console note) if not yet configured.
5. **Success state**: the form is replaced with a confirmation panel that includes a **"Also send us a WhatsApp message"** button — a `wa.me` deep link pre-filled with everything the visitor just typed. This is the "WhatsApp notification flow" from your brief, implemented the only way a zero-backend static site realistically can: the visitor's own WhatsApp opens with the message ready to send, rather than a server silently messaging on their behalf (which would require a paid WhatsApp Business API and a backend — out of scope for the free-hosting goal).

**Why nothing breaks before you finish setup:** every visitor who submits a form gets a real success confirmation and the WhatsApp option regardless of whether Sheets/EmailJS are configured — you won't lose a single lead while you're setting up the two accounts below, since the WhatsApp path needs no third-party account at all, just the phone number already in `footer.html`.

---

## 2. Your setup checklist

### A. Google Sheets logging (~5 minutes)

1. Create a new Google Sheet.
2. `Extensions → Apps Script`, delete the placeholder code, and paste in the contents of **`scripts/google-apps-script.gs`** (already written for you — reads the incoming form data and appends a row, auto-creating one sheet tab per form type on first use).
3. `Deploy → New deployment → Web app`. Set **Execute as: Me**, **Who has access: Anyone**.
4. Copy the `/exec` URL it gives you.
5. Paste it into `js/config.js` → `googleSheets.webAppUrl`.

### B. EmailJS notifications (~10 minutes)

1. Create a free account at emailjs.com and connect an email service (Gmail, Outlook, etc.) under **Email Services** — copy the **Service ID**.
2. Create one template under **Email Templates** with just two merge fields in the body: `{{form_type}}` and `{{summary}}` (e.g. subject line `New {{form_type}} — YagnaArts website`, body `{{summary}}`). One template covers all four forms — `summary` is a pre-formatted dump of whatever fields that particular form collected, built in `forms.js`. Copy the **Template ID**.
3. Copy your **Public Key** from Account → General.
4. Paste all three into `js/config.js` → `emailjs.{publicKey, serviceId, templateId}`.

### C. WhatsApp number

Update the placeholder `910000000000` in `js/config.js` (`whatsapp.businessNumber`) **and** in `src/components/footer.html` and `mobile-menu.html` (search for the same number) to your real business WhatsApp number, digits only, country code first, no `+` or spaces. Rebuild after editing.

---

## 3. A limitation worth knowing about

The Custom Orders form includes a photo upload field. Neither Google Sheets nor EmailJS's free tier handle file uploads well from client-side JS (Sheets can't receive binary data this way at all; EmailJS attachments are size-capped and need a paid tier at real volume). Rather than silently dropping the photo or over-engineering a Firebase Storage integration this early, the success panel for that specific form tells the visitor to also send the photo via the WhatsApp button — which handles images natively and is a path Indian customers already expect for exactly this kind of request. Firebase Storage for direct photo uploads is on the future roadmap (Phase 1's roadmap section) once there's a real backend to attach it to.

---

## 4. Verification performed

- `node --check` on `js/config.js` and `js/modules/forms.js` — both pass.
- Rebuilt the full site — unaffected (these are plain JS modules, not templated).
- Traced every form's field names against what `forms.js` reads via `FormData` — confirmed the honeypot field is correctly excluded from logged data on all four forms.
- Confirmed via grep that all four forms' submit buttons match the `button[type="submit"]` selector `forms.js` looks for.

**What I could not verify:** the actual Sheets/EmailJS round-trip, since that requires your real account credentials, which only you can create. Once you complete the checklist above, submit each form once and check that a row appears in your Sheet and an email arrives — that's the one part of this phase only you can confirm end-to-end.

---

**Next:** Phase 12 — SEO Implementation. Meta titles/descriptions already exist per-page from Phases 8–9; this phase adds JSON-LD structured data (Product, Organization, BreadcrumbList), Open Graph/Twitter Card tags, a real `robots.txt`, and folds the sitemap generation already in `build.js` into the SEO story properly.
