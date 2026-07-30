# YagnaArts — Phase 5: Wireframes

**Builds on:** [Phase 1](phase-1-business-analysis.md) · [Phase 2](phase-2-information-architecture.md) · [Phase 3](phase-3-brand-identity.md) · [Phase 4](phase-4-design-system.md)
**Status:** Draft for approval — structure only, no visual styling (that's Phase 6)

---

## 0. Homepage Section Consolidation Decision

Your brief lists ~20 homepage sections (Featured Categories, Trending, Best Sellers, New Arrivals, Luxury Collection, Personalized Gifts, Wedding Collection, Festival Collection, Home Decor, Corporate Gifts, Limited Edition, Why Choose Us, How Custom Orders Work, Testimonials, Instagram, Artist Story, FAQ, Newsletter...). Stacking all of these as separate full-width sections would produce a 15,000px+ scroll and hurt both conversion and Core Web Vitals (too much DOM/imagery above the fold budget).

**Decision:** the 8 individual collection-highlight sections (Luxury, Personalized, Wedding, Festival, Home Decor, Corporate, Limited Edition, Seasonal) are consolidated into **one interactive "Shop by Collection" tabbed/carousel section** — every collection is still featured and one click away, but it costs the page one section's worth of height instead of eight. This is flagged explicitly because it deviates from a literal reading of the brief, in service of the same brief's performance and conversion goals.

Final homepage section count: **13 sections + nav + footer.**

---

## 1. Homepage Wireframe

### 1.1 Desktop (≥1200px)

```
┌────────────────────────────────────────────────────────────────────┐
│ [Logo]   Shop▾  Collections▾  Custom Orders  Wedding  Corporate     │  ← sticky nav
│          Blog  About  Contact        [Search][Wishlist][Cart][🌓]   │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   HERO (full-bleed, gradient-hero-light/dark bg, 2-slide swiper)    │
│   "Memories, Cast in Light."                                        │
│   [subheadline]      [Shop Collection] [Start a Custom Order]       │
│                                              (floating glass card:  │
│                                               ★4.9 · 500+ pieces)   │
├────────────────────────────────────────────────────────────────────┤
│  TRUST STRIP: 🛡Proof before we craft  🚚Pan-India  📦Gift-ready     │
│               ⭐4.9/5 from 500+ customers                            │
├────────────────────────────────────────────────────────────────────┤
│  FEATURED CATEGORIES (icon grid, 6 cols)                            │
│  [Decor][Jewelry][Keychains][Wedding][Corporate][Personalized]      │
├────────────────────────────────────────────────────────────────────┤
│  SHOP BY COLLECTION  — tabs: Luxury|Wedding|Festival|Corporate|...  │
│  [card][card][card][card]   ←swiper→                    [View all] │
├────────────────────────────────────────────────────────────────────┤
│  TRENDING NOW               [card][card][card][card]  ←swiper→     │
├────────────────────────────────────────────────────────────────────┤
│  BEST SELLERS                [card][card][card][card]  ←swiper→    │
├────────────────────────────────────────────────────────────────────┤
│  NEW ARRIVALS                [card][card][card][card]  ←swiper→    │
├────────────────────────────────────────────────────────────────────┤
│  WHY CHOOSE YAGNAARTS  (4-col icon+text: Proof step, Handcrafted,   │
│  Premium packaging, Pan-India shipping)                             │
├────────────────────────────────────────────────────────────────────┤
│  HOW CUSTOM ORDERS WORK  (4-step connected timeline)                │
│  1.Share your idea → 2.Get a digital proof → 3.Approve →4.We craft │
├────────────────────────────────────────────────────────────────────┤
│  CUSTOMER TESTIMONIALS  (swiper: photo + quote + ★rating)           │
├────────────────────────────────────────────────────────────────────┤
│  ARTIST STORY  (split: image left / narrative + CTA right)          │
├────────────────────────────────────────────────────────────────────┤
│  INSTAGRAM GALLERY  (6-image grid + @handle follow CTA)             │
├────────────────────────────────────────────────────────────────────┤
│  FAQ PREVIEW  (accordion, top 5) [See all FAQs →]                   │
├────────────────────────────────────────────────────────────────────┤
│  NEWSLETTER BANNER (gradient-gold bg) "Get 10% off your first       │
│  custom order" [email input][Subscribe]                             │
├────────────────────────────────────────────────────────────────────┤
│ FOOTER: Brand | Shop | Company | Support&Policies | Newsletter       │
│         © YagnaArts · payment icons · social icons                  │
└────────────────────────────────────────────────────────────────────┘
```

### 1.2 Mobile (<576px)

All sections above stack **full-width, single column**; product carousels become **horizontal swipe** (1.2 cards visible, peek-next pattern to signal scrollability); Featured Categories becomes a 3-column icon grid instead of 6; "Why Choose" and "How Custom Orders Work" collapse from 4-column to stacked cards; sticky nav collapses to `[☰][Logo][Search][Cart]`.

---

## 2. Shop / Collection Grid Wireframe

```
┌───────────────────────────────────────────────────────────┐
│ Breadcrumb: Home / Collections / Wedding Collection        │
├───────────┬─────────────────────────────────────────────────┤
│ FILTERS   │  Sort: [Best Match ▾]      "128 pieces" [Grid|List]│
│ (sidebar, │  ┌────────┐┌────────┐┌────────┐┌────────┐        │
│ desktop)  │  │ card   ││ card   ││ card   ││ card   │        │
│ ▸Category │  └────────┘└────────┘└────────┘└────────┘        │
│ ▸Price    │  ┌────────┐┌────────┐┌────────┐┌────────┐        │
│ ▸Occasion │  │ card   ││ card   ││ card   ││ card   │        │
│ ▸Material │  └────────┘└────────┘└────────┘└────────┘        │
│ ▸Availab. │           [Load more / pagination]               │
│ [Clear]   │                                                  │
└───────────┴─────────────────────────────────────────────────┘
```

**Mobile:** Filters move behind a `[Filter ▾]` button that opens a bottom sheet (not sidebar); grid becomes 2 columns; sort becomes a second pill button next to Filter, both sticky just below the breadcrumb on scroll.

**Card anatomy (reused everywhere):** image (1:1) → badge (top-left) → wishlist icon (top-right) → title → price (+ struck original if discounted) → micro-rating (★4.8 · 32) → quick "Add to Cart" icon-button revealed on hover (desktop) / always visible (mobile, since there's no hover).

---

## 3. Product Detail Page (PDP) Wireframe

```
┌───────────────────────────────────────────────────────────┐
│ Breadcrumb: Home / Collections / [Collection] / [Product]  │
├───────────────────────┬───────────────────────────────────┤
│  GALLERY               │  Product Title                    │
│  [thumb][thumb][thumb] │  ★4.8 (32 reviews)  ·  SKU/Stock   │
│  ┌───────────────────┐│  ₹1,899   ~~₹2,299~~  (17% off)    │
│  │                   ││  Short value line (material+size)  │
│  │   MAIN IMAGE      ││  ─────────────────────────────     │
│  │   (zoom on hover/  ││  Customization options:            │
│  │    pinch on mobile)││  [Photo upload][Name/date input]   │
│  │                   ││  Production time: "5–7 days" badge │
│  └───────────────────┘│  Qty [ - 1 + ]                      │
│                        │  [ Add to Cart ]  [ Buy Now ]      │
│                        │  ♡ Wishlist   ⤴ Share              │
│                        │  🚚 Shipping info · ↩ Returns info  │
├───────────────────────┴───────────────────────────────────┤
│ TABS: Description | Specifications | Care Instructions |    │
│       Reviews (32) | FAQ                                    │
│ [tab content panel]                                         │
├───────────────────────────────────────────────────────────┤
│ FREQUENTLY BOUGHT TOGETHER   [+][+]  = Bundle price [Add all]│
├───────────────────────────────────────────────────────────┤
│ RELATED PRODUCTS        [card][card][card][card] ←swiper→   │
├───────────────────────────────────────────────────────────┤
│ RECENTLY VIEWED         [card][card][card][card] ←swiper→   │
└───────────────────────────────────────────────────────────┘
```

**Mobile:** Gallery becomes a full-width swiper with dot indicators (thumbnails hidden, swipe instead); the price/CTA block becomes a **sticky bottom bar** (`Add to Cart` / `Buy Now`) once the user scrolls past the initial fold, so purchase action is always reachable without scrolling back up — important given persona research shows sentimental gifters browse specs/reviews at length before committing.

---

## 4. Custom Orders Page Wireframe

```
┌───────────────────────────────────────────────────────────┐
│ HERO: "Turn Your Memory Into a Masterpiece"                 │
├───────────────────────────────────────────────────────────┤
│ HOW IT WORKS (4-step timeline, same component as homepage)  │
├───────────────────────────────────────────────────────────┤
│ EXAMPLES CAROUSEL (past custom pieces, before/after-style)  │
├───────────────────────────────┬─────────────────────────────┤
│ INTAKE FORM                    │  SIDE PANEL                 │
│ Occasion [dropdown]             │  "What happens after you    │
│ Upload photo(s) [drop zone]     │   submit?" — reassurance    │
│ Describe your idea [textarea]   │  copy + expected proof      │
│ Budget range [dropdown]         │  turnaround + FAQ mini-list │
│ Name / Phone / Email            │                              │
│ [ Submit Custom Request ]       │                              │
├───────────────────────────────┴─────────────────────────────┤
│ FAQ (custom-order-specific: revisions, deadlines, pricing)   │
└───────────────────────────────────────────────────────────┘
```

Directly implements the Phase 1 requirement that personalization's highest-anxiety moment (submitting a custom request) is paired with reassurance content in the same viewport, not buried elsewhere.

---

## 5. Cart Wireframe

```
┌───────────────────────────────────────────────────────────┐
│ Your Cart (3 items)                                         │
├───────────────────────────────────┬─────────────────────────┤
│ [img] Product name                 │ ORDER SUMMARY           │
│       Customization: "Ananya+Raj"  │ Subtotal      ₹4,997    │
│       Qty [-1+]      ₹1,899 [Remove]│ Coupon [____][Apply]   │
│ ─────────────────────────────────  │ Shipping      ₹99       │
│ [img] Product name                  │ ─────────────────────  │
│       Qty [-2+]      ₹899  [Remove] │ Total         ₹5,096   │
│ ─────────────────────────────────  │ [ Proceed to Checkout ] │
│ SAVED FOR LATER (2)                 │ 🔒 Secure checkout note │
│ [item][item]  [Move to cart]        │                         │
└─────────────────────────────────────┴─────────────────────────┘
```

**Empty state:** illustration + "Your cart's feeling light — here's what people are loving right now" + Best Sellers carousel (per Phase 3 tone-of-voice rule on empty states).

**Mobile:** Order Summary moves below the item list and becomes a sticky collapsed bar ("₹5,096 · Proceed to Checkout ▾") that expands to show the full breakdown on tap.

---

## 6. Checkout Wireframe

```
┌───────────────────────────────────────────────────────────┐
│ Step indicator:  ① Details  —  ② Shipping  —  ③ Review      │
├───────────────────────────────────┬─────────────────────────┤
│ [Step content — one step visible   │ ORDER SUMMARY (sticky)  │
│  at a time, single-column form,    │ [collapsed item list]   │
│  not all steps at once]            │ Subtotal / Shipping /   │
│                                     │ Total                   │
│ ① Customer Details: Name, Email,   │                         │
│    Phone                            │                         │
│ ② Shipping Address (+ "Billing      │                         │
│    same as shipping" checkbox)      │                         │
│ ③ Review order + Payment            │                         │
│    placeholder ("Payment integration│                         │
│    coming soon — orders confirmed   │                         │
│    via WhatsApp/email for now") +   │                         │
│    Terms checkbox + [Place Order]   │                         │
└───────────────────────────────────┴─────────────────────────┘
```

**Design rationale:** a step-based single-column checkout (not one long form) reduces perceived effort and is the highest-converting pattern for mobile, which is the majority of Indian D2C traffic. The payment step is explicitly labeled as a placeholder (per project scope — no real payment gateway yet) rather than faked, preserving trust.

**Confirmation page:** order number, summary, "What happens next" (proof/production timeline reminder for custom items), and a prompt to follow Instagram/join newsletter.

---

## 7. Cross-Page Structural Notes

- **Sticky elements budget:** nav (top) + one contextual sticky bar (PDP buy bar / Cart summary bar / Checkout summary) — never more than two sticky elements competing for screen edges at once.
- **Breadcrumbs** appear on every page except Homepage/Cart/Checkout (per Phase 2 URL conventions).
- **Empty/loading/error states** are wireframed for: Cart, Wishlist, Search results, and form submission — each gets a designed state, not a blank page (Phase 4 skeleton-loading token applies to all card grids while data loads).

---

**Next:** Phase 6 — High-Fidelity UI (applying the Phase 3 brand system and Phase 4 tokens onto these wireframes — actual visual composition, described/specified per template ahead of coding in Phase 7+).
