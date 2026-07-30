# YagnaArts — Phase 4: Design System

**Builds on:** [Phase 1](phase-1-business-analysis.md) · [Phase 2](phase-2-information-architecture.md) · [Phase 3](phase-3-brand-identity.md)
**Status:** Draft for approval

This phase turns Phase 3's brand decisions into concrete, implementable CSS custom-property tokens. Everything here will live in `/css/tokens.css` starting in Phase 7 and consumed by every component — no magic numbers in component CSS after this point.

---

## 1. Breakpoints (mobile-first)

| Token | Width | Target devices |
|---|---|---|
| `xs` (default, no media query) | `<576px` | Small phones, folded foldables (e.g. Galaxy Fold cover screen) |
| `sm` | `≥576px` | Large phones, unfolded compact foldables |
| `md` | `≥768px` | Tablets (portrait), unfolded foldables |
| `lg` | `≥992px` | Tablets (landscape), small laptops |
| `xl` | `≥1200px` | Laptops/desktops |
| `xxl` | `≥1400px` | Large desktops |
| `xxxl` (custom, beyond Bootstrap default) | `≥1920px` | 4K/ultra-wide — caps container width, doesn't stretch content edge-to-edge |

Bootstrap 5's grid covers `xs`–`xxl` natively; `xxxl` is a project-added max-width guard (see §2) so 4K displays don't produce absurdly long line-lengths.

**Fold-device rule:** all flex/grid layouts use `minmax(0, 1fr)` (never fixed px widths) so a 280px folded cover screen degrades gracefully instead of overflowing.

---

## 2. Layout & Containers

| Token | Value | Use |
|---|---|---|
| `--container-max` | `1320px` | Standard content container (Bootstrap `.container-xxl` equivalent) |
| `--container-max-wide` | `1600px` | Full-bleed sections (hero, Instagram gallery) on `xxxl` screens |
| `--container-padding-inline` | `clamp(1rem, 4vw, 2.5rem)` | Fluid side padding — no manual breakpoint tuning needed |
| `--grid-gutter` | `1.5rem` (desktop) / `1rem` (mobile) | Product grid gutters |

**Product grid columns:** 2 (xs) → 2 (sm) → 3 (md) → 4 (lg/xl) → 4 (xxl, wider cards instead of 5+ columns — keeps cards premium-sized, not cramped).

---

## 3. Spacing Scale

4px base unit, exponential-ish progression for real visual rhythm (not pure linear):

```css
--space-1: 0.25rem;  /* 4px  */
--space-2: 0.5rem;   /* 8px  */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.5rem;   /* 24px */
--space-6: 2rem;     /* 32px */
--space-7: 3rem;     /* 48px */
--space-8: 4rem;     /* 64px */
--space-9: 6rem;     /* 96px */
--space-10: 8rem;    /* 128px */
```

**Section vertical rhythm:** `padding-block: clamp(var(--space-7), 8vw, var(--space-9))` — sections breathe more on large screens, compress gracefully on mobile without a breakpoint jump.

---

## 4. Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `8px` | Badges, chips, small buttons |
| `--radius-md` | `14px` | Inputs, secondary buttons |
| `--radius-lg` | `20px` | Cards, product tiles |
| `--radius-xl` | `28px` | Feature cards, modals, glass panels |
| `--radius-pill` | `999px` | Primary CTA buttons, tags |
| `--radius-circle` | `50%` | Avatar, icon buttons, theme toggle |

Consistent generous rounding (14–28px range) is what reads as "Soft UI / Apple-inspired" per Phase 3 — sharp 4px corners are avoided everywhere except tiny badges.

---

## 5. Elevation & Shadow System

Two parallel shadow sets — dark-theme shadows must be *darker + tighter*, not the same shadow just placed on a dark background (which reads muddy), while light-theme shadows are soft and diffused for the "premium shadow" look.

### Light Theme
```css
--shadow-sm: 0 2px 8px rgba(20, 20, 25, 0.06);
--shadow-md: 0 8px 24px rgba(20, 20, 25, 0.08);
--shadow-lg: 0 16px 48px rgba(20, 20, 25, 0.12);
--shadow-gold-glow: 0 8px 32px rgba(201, 162, 75, 0.35);   /* CTA hover */
```

### Dark Theme
```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.35);
--shadow-md: 0 8px 24px rgba(0, 0, 0, 0.45);
--shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.55);
--shadow-sapphire-glow: 0 8px 32px rgba(30, 96, 145, 0.45); /* CTA hover */
```

**Elevation map:** `sm` = resting cards/inputs → `md` = hover/raised cards, dropdowns → `lg` = modals, mega-menu, sticky navbar-on-scroll → glow shadows reserved exclusively for primary CTA hover/focus (keeps them meaningful, not decorative noise).

---

## 6. Glassmorphism Component Spec

Used for: sticky navbar (on scroll), mega-menu panels, mobile menu backdrop, product quick-view modal, floating "Custom Order" CTA card on homepage.

```css
--glass-bg-light: rgba(255, 255, 255, 0.65);
--glass-bg-dark: rgba(23, 23, 27, 0.65);
--glass-border: rgba(255, 255, 255, 0.25); /* hairline highlight edge, both themes */
--glass-blur: blur(16px);
--glass-saturate: saturate(160%);
```

```css
.glass-panel {
  background: var(--glass-bg-light);
  backdrop-filter: var(--glass-blur) var(--glass-saturate);
  -webkit-backdrop-filter: var(--glass-blur) var(--glass-saturate);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}
```

**Fallback rule (Performance/Accessibility):** if `backdrop-filter` is unsupported (rare, older browsers) or `prefers-reduced-transparency` is set, fall back to a solid `--bg-surface` at 96% opacity — checked via `@supports`. No glass effect ever reduces text-contrast below WCAG AA against its actual rendered background.

---

## 7. Motion & Easing Tokens

```css
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);   /* general UI transitions */
--ease-out-soft: cubic-bezier(0.16, 1, 0.3, 1);  /* card/image reveals — premium "settle" feel */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* micro-interactions: like/wishlist pop */

--duration-fast: 150ms;
--duration-base: 300ms;
--duration-slow: 500ms;
--duration-hero: 900ms;
```

| Interaction | Duration | Easing |
|---|---|---|
| Button hover/press | `--duration-fast` | `--ease-standard` |
| Card hover lift + image zoom | `--duration-base` | `--ease-out-soft` |
| Wishlist heart pop | `--duration-base` | `--ease-spring` |
| Modal/mega-menu open | `--duration-base` | `--ease-out-soft` |
| Mobile menu slide-in | `--duration-slow` | `--ease-out-soft` |
| Hero entrance (AOS/GSAP) | `--duration-hero` | `--ease-out-soft` |
| Page scroll-reveal (AOS) | `--duration-slow` | `--ease-out-soft` |

**Mandatory accessibility gate:** every animation is wrapped so that `@media (prefers-reduced-motion: reduce)` collapses durations to `1ms` and disables parallax/auto-playing motion entirely — defined once globally in `tokens.css`, not per-component, so nothing is missed.

---

## 8. Z-Index Scale

```css
--z-base: 0;
--z-card-hover: 10;
--z-sticky-nav: 100;
--z-dropdown: 200;
--z-mobile-menu: 300;
--z-modal-backdrop: 400;
--z-modal: 410;
--z-toast: 500;
--z-back-to-top: 150;
--z-scroll-progress: 600;
```

A single documented scale prevents the classic "just set z-index: 9999" drift as more components are added in later phases.

---

## 9. Core Component Specs

### 9.1 Product Card
- Container: `--radius-lg`, `--shadow-sm` resting → `--shadow-md` + `translateY(-4px)` on hover, image `scale(1.05)` on hover (clipped by card's `overflow: hidden`).
- Badge slot (top-left): "New," "Best Seller," "Limited Edition" — pill shape, gradient fill per Phase 3.
- Wishlist icon (top-right): circular glass button, fills with `--color-secondary` (rose gold) + spring pop animation when toggled.
- Price row: current price in `--text-primary` bold; if discounted, original price struck-through in `--text-muted`.

### 9.2 Buttons
Sizes: `sm` (36px height), `md` (44px — meets WCAG 2.2 minimum touch target), `lg` (52px, hero CTAs). Radius: `--radius-pill` for primary/secondary actions, `--radius-md` for compact toolbar buttons (filter, sort).

### 9.3 Inputs & Forms
- Height: 48px minimum (touch target + comfortable text entry).
- Radius: `--radius-md`. Resting border `--border-subtle`, focus border `--color-accent` + `3px` outline ring (never focus-outline: none).
- Label position: floating label pattern (label sits inside field until focus/filled, then animates above) — modern, space-efficient, still fully accessible via a real `<label for>` (not placeholder-only, which fails accessibility).
- Validation: inline, icon + message below field, error uses a dedicated `--color-error: #B3261E` (not previously defined — added here as it's a UI-state color, not a brand color) — never color-only (icon + text always accompany).

### 9.4 Modals / Quick View / Mega-Menu
`--radius-xl`, `glass-panel` treatment, `--shadow-lg`, backdrop `rgba(13,13,16,0.5)` with blur. Focus-trapped, `Esc`-to-close, returns focus to the triggering element on close (WCAG 2.2 requirement carried over from Phase 2's mobile-nav note).

### 9.5 Skeleton Loading
Shimmer gradient sweep (`--gradient-gold` at 8% opacity over `--bg-surface-alt`), respects `prefers-reduced-motion` by falling back to a static pulse-opacity instead of a moving sweep.

### 9.6 Toasts / Micro-notifications
("Added to cart," "Added to wishlist") — bottom-right desktop / bottom-center mobile, `--radius-lg`, auto-dismiss 4s, pause-on-hover, `role="status"` for screen readers (non-interrupting, unlike `alert`).

---

## 10. Iconography Sizing

```css
--icon-sm: 16px;  /* inline with body text */
--icon-md: 20px;  /* nav/utility icons */
--icon-lg: 28px;  /* feature/benefit icons */
--icon-xl: 40px;  /* empty-state illustrations */
```

Minimum interactive icon *hit area* is always 44×44px even when the glyph itself is `--icon-md` (extra padding inside the button, not a bigger icon) — keeps the thin/elegant line-icon look from Phase 3 while still meeting touch-target accessibility rules.

---

## 11. Accessibility Tokens (cross-cutting, enforced at the token layer)

```css
--focus-ring: 0 0 0 3px var(--color-accent);
--min-touch-target: 44px;
--min-contrast-body: 4.5;   /* WCAG AA, enforced during content/color QA in Phase 14 */
--min-contrast-large-text: 3;
```

These aren't aspirational — Phase 14's testing checklist will validate every color pair in §5 (Phase 3) against these ratios before sign-off.

---

**Next:** Phase 5 — Wireframes (low-fidelity layout structure for Homepage, Collection/Shop grid, Product Detail Page, Custom Orders, Cart, and Checkout) — the last step before high-fidelity UI, so structural/UX decisions are locked in before visual polish begins.
