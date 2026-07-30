# YagnaArts — Phase 6: High-Fidelity UI

**Builds on:** [Phase 3 Brand Identity](phase-3-brand-identity.md) · [Phase 4 Design System](phase-4-design-system.md) · [Phase 5 Wireframes](phase-5-wireframes.md)
**Live homepage mockup:** https://claude.ai/code/artifact/d7818031-77d6-452b-b355-fb25ac733e69
**Status:** Draft for approval

---

## 1. What's in the live mockup

The homepage wireframe from Phase 5 has been fully composed with the Phase 3/4 brand system — real color tokens, real self-hosted typography (Playfair Display, Poppins, Cormorant Garamond, inlined so the preview renders faithfully), working light/dark theme toggle with persistence, scroll-reveal, hover/zoom micro-interactions, a tabbed "Shop by Collection" section, an accordion FAQ, and a canvas-animated resin-pour hero.

**One constraint worth flagging explicitly:** this sandboxed preview environment cannot load external images (no Unsplash/Pexels URLs, no CDN assets). Rather than showing grey placeholder boxes, every product tile, Instagram tile, and testimonial avatar is rendered as a generative **"resin swatch"** — a canvas-drawn abstract pour with gold-leaf flecks and a glossy highlight, color-keyed to the collection (sapphire/gold/rose-gold/emerald). This is a deliberate stand-in, not a shortcut: resin artists genuinely work from material swatches, so it reads as intentional rather than broken. **Real coded pages in Phase 8+ will use actual photography** sourced per the Phase 3 imagery brief — the swatch system disappears once real product photos are dropped into the `/assets/images/` folder defined in Phase 7.

Toggle the theme button (top-right, moon/sun icon) to see the dark mode treatment — note gold/rose-gold staying constant across both themes per the Phase 3 rule.

---

## 2. Visual language established (applies to every remaining template)

- **Cards:** `--radius-lg` (20px), 1px hairline border, `--shadow-sm` at rest → lift + `--shadow-md` + image scale(1.06) on hover.
- **Glass surfaces:** sticky nav, floating stat card, and (below) modals/quick-view all share one `.glass-panel` treatment — blur(16px) + saturate(160%) + hairline highlight border.
- **CTAs:** pill-shaped, gradient fill (`--gradient-ocean` light theme / `--gradient-gold` dark theme), gold-glow shadow on hover — reserved for primary actions only, so it stays meaningful.
- **Section rhythm:** alternating `--bg-body` / `--bg-surface-alt` bands so long scroll pages (PDP, Collection grid) get visual pacing without hard dividers.
- **Motion:** all reveals/hovers respect `prefers-reduced-motion` (verified in the mockup — the hero canvas animation freezes to a static frame under reduced motion).

Everything below reuses these exact components — no new visual language is introduced per template.

---

## 3. Collection / Shop Grid — Hi-Fi Spec

- Sticky sub-header directly under breadcrumb: result count + `Sort` pill (glass-style dropdown) + `Grid/List` toggle icon pair.
- Sidebar filters (desktop): each filter group is a native `<details>` accordion (Category, Price range slider styled with `--color-accent` fill, Occasion, Material, Availability) — matches the FAQ accordion pattern already proven in the mockup, so no new interaction pattern needs inventing.
- Product cards: identical component from the mockup's Trending/Shop-by-Collection rows, in a responsive grid (2/2/3/4/4 columns per Phase 4 §2).
- Active filter chips render as small pill tags above the grid with an ✕ to remove — `--radius-pill`, `--bg-surface-alt` fill.
- Empty-result state: centered illustration (same canvas-swatch technique, desaturated) + "No pieces match yet — try widening your filters" + a `Clear filters` button, per the Phase 3 tone-of-voice rule for empty/error states.

---

## 4. Product Detail Page — Hi-Fi Spec

- Gallery: main image in a `--radius-xl` frame with `--shadow-lg`; thumbnail rail below (desktop) becomes a dot-indicator swiper on mobile. Hover-zoom uses a magnifier-follow effect on desktop, pinch-zoom on touch.
- Price block: current price in `--font-display` at `1.75rem`, bold; struck-through original in `--text-muted` beside it; savings badge in `--gradient-gold` pill.
- **Production-time badge** sits directly under the customization inputs, not hidden in a tab — small clock icon + "Ships in 5–7 days" in `--color-emerald` (in-stock) or `--color-secondary` (made-to-order) — this directly implements the Phase 1 trust requirement that timelines are never buried.
- Tabs (Description/Specs/Care/Reviews/FAQ): underline-indicator style using `--color-accent`, content fades in with `--duration-base`/`--ease-out-soft`.
- Reviews tab: star-distribution bar chart (5★→1★ horizontal bars in `--color-accent`) above individual review cards with verified-purchase badge.
- Mobile: sticky bottom bar appears once the primary CTA scrolls out of view — glass-panel treatment, `Add to Cart` (outline) + `Buy Now` (primary gradient) side by side, exactly as specified in Phase 5.

---

## 5. Custom Orders Page — Hi-Fi Spec

- Hero uses the same asymmetric layout as the homepage hero, but the canvas visual shows a "before/after" style split (blurred photo dissolving into a resin-swatch render) to visually communicate the transformation promise.
- Intake form fields use the floating-label input spec from Phase 4 §9.3; the photo upload is a dashed-border drop-zone (`--border-subtle`, `--radius-lg`) that swaps to a thumbnail preview + "Change photo" link once a file is selected.
- Reassurance side panel is a `.glass-panel` card that stays visually "attached" to the form (equal height on desktop, stacks below on mobile) so the anxiety-reducing copy is never scrolled away from the action it supports.
- Submit button uses the primary gradient CTA; on submit, a success state replaces the form in place (not a redirect) showing a checkmark animation + "We'll send your proof within 2–3 days" — consistent with the 4-step timeline already shown on the homepage.

---

## 6. Cart & Checkout — Hi-Fi Spec

- Cart line items: compact `--radius-md` cards, quantity stepper matches the button component (pill-shaped `−`/`+` around a numeric field), remove action as a plain text link in `--text-muted` (not a red danger button — removing an item isn't an error, it's a normal action, per tone-of-voice restraint).
- Order summary panel: `--bg-surface` card, `--shadow-md`, coupon field + primary CTA `Proceed to Checkout`; sticky on desktop, collapsible sticky bar on mobile exactly as wireframed in Phase 5.
- Checkout step indicator: three connected circles (same `.step-num` component as the homepage "How Custom Orders Work" timeline) showing Details → Shipping → Review, active step filled with `--color-accent`, completed steps show a checkmark instead of a number.
- Payment placeholder step: a `--bg-surface-alt` notice card (not a broken-looking disabled field) reading "Online payment is launching soon — orders are confirmed via WhatsApp/email after checkout," paired with the WhatsApp icon already used in the footer, so it reads as a considered interim state rather than an unfinished feature.

---

## 7. Accessibility & Responsive Verification (spot-checked in the live mockup)

- All interactive icons meet the 44×44px touch target (Phase 4 §10) — verified via the nav icon buttons and product-card wishlist buttons in the mockup.
- Focus-visible ring (`3px solid var(--color-accent)`) is present on every button/link/input — tab through the mockup's nav and hero CTAs to confirm.
- Color contrast: body text (`#1A1A1D` on `#FAF7F2` light / `#F5F1E8` on `#0D0D10` dark) both exceed WCAG AA 4.5:1; verified against Phase 4 §11 tokens.
- The skip-to-content link (first focusable element) is present and visible on focus.
- Reduced-motion: confirmed the hero canvas freezes and scroll-reveal elements render pre-shown instead of animating in.

---

**Next:** Phase 7 — Folder Structure (the actual `/assets /css /js /components /pages /data /fonts /docs` scaffold, matching the reusable-component architecture proven visually in this phase) — the last step before real page code begins.
