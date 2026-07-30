# YagnaArts — Phase 2: Information Architecture

**Builds on:** [Phase 1 — Business Analysis](phase-1-business-analysis.md)
**Status:** Draft for approval

---

## 1. IA Principles

1. **Trust before transaction** — every path to "Add to Cart" passes near a trust signal (reviews, process transparency, specs) within one scroll/click, per the trust-gap risk identified in Phase 1.
2. **Occasion-first browsing, category-second** — personas shop by *occasion* (wedding, festival, corporate) as often as by *product type* (keychain, decor). Navigation must support both without duplicating content.
3. **Shallow depth** — max 3 clicks from homepage to any product; max 2 clicks to any collection.
4. **One custom-order path, everywhere** — "Custom Orders" is never more than one click away (persistent nav item + repeated CTA on PDPs/collections), because personalization is the core differentiator.
5. **SEO-clean URLs** — human-readable, keyword-rich, stable (no query-string-only product identity), ready for canonical/sitemap generation in Phase 12.

---

## 2. Full Sitemap

```
/ (Homepage)
├── /shop/ (All Products — filterable master grid)
├── /collections/
│   ├── /collections/personalized-gifts/
│   ├── /collections/wedding-collection/
│   ├── /collections/home-decor/
│   ├── /collections/kitchen-collection/
│   ├── /collections/office-collection/
│   ├── /collections/jewelry/
│   ├── /collections/keychains/
│   ├── /collections/bookmarks/
│   ├── /collections/baby-collection/
│   ├── /collections/pet-collection/
│   ├── /collections/religious-collection/
│   ├── /collections/corporate-gifts/
│   ├── /collections/memory-preservation/
│   ├── /collections/festival-collection/
│   ├── /collections/luxury-collection/
│   ├── /collections/limited-edition/
│   └── /collections/seasonal-collection/
├── /product/[product-slug]/ (Product Detail Page — one template, JSON-driven)
├── /custom-orders/ (How custom orders work + intake form)
├── /wedding-gifting/ (Occasion landing page — curated cross-collection)
├── /corporate-gifting/ (B2B landing page — bulk inquiry form)
├── /festival-gifting/ (Seasonal occasion landing page, content refreshed per calendar)
├── /about/ (Artist Story / Brand Story)
├── /blog/
│   ├── /blog/category/resin-art-care/
│   ├── /blog/category/gift-ideas/
│   ├── /blog/category/wedding-gifts/
│   ├── /blog/category/home-decor-trends/
│   ├── /blog/category/corporate-gifting/
│   ├── /blog/category/festival-collections/
│   ├── /blog/category/diy-resin-tips/
│   └── /blog/[post-slug]/
├── /reviews/ (Aggregated testimonials — optional standalone, also embedded elsewhere)
├── /faq/
├── /contact/
├── /search/ (Live search results page — also inline overlay)
├── /wishlist/
├── /cart/
├── /checkout/
├── /checkout/confirmation/
├── /account/ (placeholder — "Coming soon", future-roadmap stub, see §7)
├── /policies/
│   ├── /policies/shipping-returns/
│   ├── /policies/privacy-policy/
│   ├── /policies/terms-of-service/
│   └── /policies/care-instructions/
├── /404/
└── /sitemap.xml, /robots.txt (non-navigable, SEO infra — Phase 12)
```

**Total primary templates needed:** Homepage, Collection/Category grid, Product Detail, Occasion Landing, Custom Orders, About, Blog Index, Blog Post, FAQ, Contact, Search Results, Wishlist, Cart, Checkout (+Confirmation), Policy (generic), 404. Everything above reuses these ~16 templates — no one-off pages, per the "reusable components" mandate.

---

## 3. Primary Navigation (Desktop Sticky Navbar)

```
[Logo: YagnaArts]   Shop ▾   Collections ▾   Custom Orders   Wedding   Corporate   Blog   About   Contact        [Search] [Wishlist] [Cart] [Theme Toggle]
```

- **Shop ▾** — mega-menu: quick links to Best Sellers, New Arrivals, All Products, plus a "Shop by Occasion" sub-column (Wedding / Festival / Corporate) and "Shop by Type" sub-column (Decor / Jewelry / Keychains / Bookmarks / Baby / Pet / Religious).
- **Collections ▾** — mega-menu listing all 17 collections grouped into 4 clusters: *Gifting* (Personalized, Corporate, Memory Preservation), *Occasions* (Wedding, Festival, Seasonal), *Home & Lifestyle* (Home Decor, Kitchen, Office, Jewelry, Keychains, Bookmarks), *Special* (Luxury, Limited Edition, Baby, Pet, Religious).
- **Custom Orders** — direct link, not a dropdown (matches "one click away" principle).
- **Wedding / Corporate** — top-level occasion links since these are named target-audience segments in Phase 1 with dedicated landing pages and (for Corporate) a distinct B2B intent.
- Utility icons (Search / Wishlist / Cart) persist on scroll; cart shows live item-count badge.

## 4. Mobile Navigation

- Hamburger → full-screen slide-in panel (right-to-left), not a dropdown — better for nested categories on small screens.
- Structure: accordion-style nested categories (Shop → expands to Occasion/Type sub-lists; Collections → expands to the 4 clusters above).
- Persistent bottom-of-panel: Search, Wishlist, Cart, Theme Toggle, WhatsApp contact shortcut.
- Requirements carried into Phase 10 (JS): smooth open/close animation, swipe-to-close gesture, focus trap + Escape-to-close for keyboard/screen-reader users, `aria-expanded` on accordion triggers.

## 5. Footer Structure

```
Column 1: Brand — logo, one-line mission, social icons (Instagram, Facebook, YouTube, Pinterest, WhatsApp)
Column 2: Shop — Best Sellers, New Arrivals, Custom Orders, Gift Cards (future), All Collections
Column 3: Company — About/Artist Story, Blog, Reviews, FAQ, Contact
Column 4: Support & Policies — Shipping & Returns, Care Instructions, Privacy Policy, Terms of Service
Column 5: Newsletter — email capture + "Get 10% off your first custom order" hook
Bottom bar: © YagnaArts, payment-method icons (placeholder), "Made with love in India"
```

---

## 6. Collection Hierarchy & Cross-Linking Model

Collections are **not mutually exclusive** — a single product (e.g., "Personalized Wedding Photo Coaster Set") belongs to multiple collections (`Wedding Collection` + `Personalized Gifts` + `Home Decor`). This means:

- Product data model (Phase 7 JSON schema) needs a `collections: []` array, not a single `category` field.
- Collection pages are **filtered views** over one product dataset, not separate content silos — avoids duplication, matches "avoid duplicate code" mandate.
- Occasion landing pages (`/wedding-gifting/`, `/corporate-gifting/`, `/festival-gifting/`) are curated, editorially-written pages that pull products from multiple collections + add persona-specific trust content (bulk pricing for Corporate, return-gift guidance for Wedding) — distinct from `/collections/wedding-collection/`, which is the raw filterable grid. Both link to each other.

---

## 7. Key User Flows

**A. Discovery → Purchase**
`Homepage → Collection/Occasion page → Product Detail → Add to Cart → Cart → Checkout → Confirmation`

**B. Personalized/Custom Order**
`Homepage or PDP "Customize This" → Custom Orders page (how-it-works + intake form: occasion, photo upload, notes) → Confirmation ("We'll send a proof within X days") → (manual founder follow-up outside platform, until backend automation exists)`

**C. Corporate/Bulk**
`Corporate Gifting landing → Bulk inquiry form (quantity, deadline, company details) → Confirmation → manual follow-up`

**D. Trust-building loop (cross-cutting)**
`Any product/collection page → Reviews section (in-page) → Instagram Gallery (homepage/footer) → About/Artist Story` — these three are deliberately interlinked so a hesitant buyer always has a next trust-building step rather than a dead end.

**E. Search**
`Sticky navbar search icon → inline overlay with live-filter dropdown (top 5 matches) → "View all results" → /search/?q=...` full results page with the same filter/sort UI as `/shop/`.

---

## 8. URL & Breadcrumb Conventions

- Lowercase, hyphenated, keyword-rich: `/product/personalized-couple-photo-resin-frame/`
- Breadcrumb pattern: `Home / Collections / Wedding Collection / [Product Name]` — reflects the collection the user arrived through (stored in session), defaulting to primary collection if direct entry (e.g. from search/social).
- Blog: `/blog/category/gift-ideas/` and `/blog/personalized-resin-gifts-for-weddings/` (flat post slugs, category as a filter, not a nested path) — keeps posts stable even if categorized differently later.

---

## 9. Future-Roadmap Stubs (present in IA now, inert until backend exists)

Per Phase 1's mandate not to block future integration: `/account/`, wishlist-sync, and gift-card entry points are included in the sitemap/nav **now** as visible-but-clearly-labeled "Coming Soon" states (e.g., Account icon opens a simple "Accounts launching soon — join the newsletter" modal) rather than being bolted on awkwardly later. Cart/Wishlist themselves are fully functional now via LocalStorage (per your stated dev principles), just not yet synced to a server account.

---

**Next:** Phase 3 — Brand Identity (logo direction, full color system, typography pairing, imagery/photography style, tone of voice) — built directly on the luxury/trust positioning from Phase 1 and the content structure defined here.
