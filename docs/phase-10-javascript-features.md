# YagnaArts — Phase 10: JavaScript Features

**Builds on:** all prior phases — this is where every "activates in Phase 10" note scattered through Phases 8–9 gets wired up
**Status:** Implemented

---

## 1. Architecture: one script tag, everywhere

Rather than giving each of the 20 page sources a different combination of page-specific `<script>` tags, every page now loads exactly one thing: `<script type="module" src="/js/main.js"></script>`. `js/main.js` imports every feature module and initializes all of them unconditionally on `DOMContentLoaded` — each module internally checks for its own DOM hooks (e.g. `cart.js` looks for `[data-cart-populated]`) and silently no-ops if that page doesn't have them. This means adding main.js to a new page later (Phase 11's forms, or any future page) never requires deciding which scripts it needs — it just works, and dead code for absent features costs nothing at runtime beyond a cheap `querySelector` returning null.

Modules (`/js/modules/`): `theme.js`, `navigation.js`, `tabs.js`, `scroll-chrome.js`, `product-data.js`, `cart.js`, `wishlist.js`, `shop-filter.js`, `pdp.js`, `checkout.js`, `search.js`.

## 2. What's now real

- **Theme toggle** — persists to `localStorage`, syncs the icon, works from both the desktop nav and mobile menu buttons.
- **Mobile menu** — opens with a focus trap (Tab cycles inside it, Escape closes, focus returns to the hamburger button on close), matching the Phase 2 accessibility requirement.
- **Mega-menus** — click-to-toggle on top of the CSS `:hover`, so touch/keyboard users aren't left out.
- **Scroll progress bar + back-to-top button** — new site-wide chrome (markup added to `header.html`/`footer.html` this phase) fulfilling two animation requirements from the original brief that hadn't been built yet.
- **Cart & Wishlist** — fully working, `localStorage`-backed (keys `ya-cart` / `ya-wishlist`), with live nav badge counts on every page, empty/populated state switching, quantity controls, and removal.
- **Shop/collection filtering & sorting** — reads `data-price`/`data-rating`/`data-availability` straight off each product card (no extra fetch), matching the filter checkboxes and sort dropdown built in Phase 9.
- **PDP** — thumbnail gallery swapping, quantity stepper, the mobile sticky buy bar (via `IntersectionObserver` on the primary CTA row), and a real Recently Viewed section backed by `localStorage`.
- **Checkout** — 3-step navigation with per-step validation (`reportValidity()` before advancing), a stepper indicator that marks completed steps, and order placement: generates a reference number, clears the cart, and hands off to the confirmation page. No payment gateway exists yet — this is exactly what the payment-note copy in Phase 9 promised.
- **Search** — the nav overlay live-filters as you type (top 5 results + "view all" link) and `/pages/search.html` supports both `?q=` deep links and its own live input, sharing one product-matching function.
- **Newsletter forms & footer year** — small site-wide conveniences (button flips to "Subscribed ✓", footer copyright year is never hardcoded-stale).

## 3. A design tradeoff, stated plainly

The original brief lists AOS as the scroll-animation library. Rather than adding the AOS CDN + `data-aos` attributes to all 19 interior pages (real weight: another library fetched everywhere for a handful of fade-ins), I reused the zero-dependency `.reveal`/`IntersectionObserver` utility already sitting unused in `grid.css` since Phase 8, wired up in `main.js`'s `initScrollReveal()`. AOS stays exactly where it earns its keep: the homepage's more elaborate entrance choreography (already built in Phase 8), plus Swiper for testimonials and GSAP for the hero. Interior pages get the same *effect* (sections fade up on scroll, respecting `prefers-reduced-motion`) without the extra library weight — a performance-minded call that Phase 13 will elaborate on.

## 4. Verification performed

- `node --check` on every one of the 12 JS files — all pass (valid syntax, correct ES module `import`/`export` usage).
- Rebuilt the full site after wiring — all 50 pages still generate cleanly.
- Cross-referenced every `data-*` attribute each JS module queries for against the actual generated HTML (nav badges, PDP hooks, checkout stepper/panels, shop filter controls, cart/wishlist empty-vs-populated containers) — confirmed present and matching in every case via targeted greps across the real output, not just the source templates.

**Not yet verified:** live interaction in an actual browser (same sandbox-networking limitation noted in Phase 8 — this environment can't reach your XAMPP Apache instance). Please click through cart/wishlist/checkout/search/theme-toggle on your end; I'm confident in the wiring based on static verification, but browser behavior (especially the mobile menu focus trap and PDP sticky bar) is worth your own pass.

---

**Next:** Phase 11 — Forms Integration. The Contact, Custom Orders, Wedding/Corporate inquiry, and Newsletter forms are all fully built with real fields and honeypot traps — this phase connects them to Google Sheets (via Apps Script), EmailJS notifications, spam validation, and the WhatsApp handoff.
