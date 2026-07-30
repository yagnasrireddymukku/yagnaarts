# YagnaArts — Phase 8: Homepage Development

**Builds on:** [Phase 6 High-Fidelity UI](phase-6-high-fidelity-ui.md), [Phase 7 Folder Structure](phase-7-folder-structure.md)
**Status:** Implemented — `index.html` is now a real, generated file

---

## 1. What was built

`src/pages/home.html` is the real homepage source: 13 content sections (Hero, Trust Strip, Featured Categories, Shop by Collection, Trending Now, Best Sellers, New Arrivals, Why Choose YagnaArts, How Custom Orders Work, Testimonials, Artist Story, Instagram Gallery, FAQ preview, Newsletter) plus the shared header/footer, matching the Phase 5/6 design exactly. Running `npm run build` renders it to the real `/index.html` at the project root — confirmed: one `<!DOCTYPE>`, one `<head>`, one `<body>`, zero leftover template markers, 35 product cards rendered across the various rows.

New supporting files:
- **`css/layout/grid.css`, `css/components/{navigation,buttons,cards,tabs,accordion,timeline}.css`, `css/pages/home.css`** — the real, working CSS for every component this page uses, wired into `css/main.css`'s import chain.
- **`src/components/product-card.html`, `testimonial-card.html`** — new reusable partials. I extended `scripts/build.js`'s templating engine to support `{{#each list}}{{> partial-name}}{{/each}}`, so the same product-card markup renders in eight different homepage rows (and will render again on collection/shop pages in Phase 9) from one source file — directly serving "avoid duplicate code."
- **Two build bugs fixed while wiring this up** (both now covered by the recursion-depth guard added to `build.js`): a documentation comment inside `header.html` accidentally contained the literal text of its own include marker, which the build script misread as a second real include and flagged as circular; the same issue existed in the new partials' comments. Both are fixed, and `build.js` now throws a clear error instead of a stack overflow if a future partial ever references itself.
- **A curated-list fallback in `build.js`**: with only 10 seed products, filtering strictly by `badge === 'bestseller'` returned a single product — not a believable "Best Sellers" row. `curatedList()` now leads with explicitly badged products and tops up the rest by rating, so every row shows a full set regardless of how thin the badge coverage is today. This stops mattering once Phase 9 expands the catalog.

## 2. Imagery: how the "use Unsplash/Pexels" instruction was actually fulfilled

Your original brief calls for royalty-free stock photography matching the resin-art mood. Unsplash's old "Source" placeholder endpoint (`source.unsplash.com`) is dead (confirmed — returns 503), so rather than guess at photo URLs (which risks broken images), I used web search to find real Pexels photo pages, then verified every single image URL actually resolves with a live HTTP request before using it. All ~25 images across the homepage (hero, 10 products, 17 collection heroes for later use, 4 testimonial avatars, 6 Instagram tiles, artist story) are confirmed-working Pexels CDN links today. `data/products.json` and `data/collections.json` are annotated to make clear these are mood-matched placeholders, not literal product photos — swap for real studio photography as it's shot.

## 3. What's intentionally not interactive yet

Per your own phase breakdown, JavaScript *features* are Phase 10 — this phase is homepage structure, styling, and content. Two categories of script are already wired in, and one is deliberately deferred:

- **Wired now (library usage, not custom features):** AOS scroll-reveal (`data-aos="fade-up"` throughout), a GSAP entrance animation for the hero, and a Swiper carousel for testimonials. All respect `prefers-reduced-motion`, and a `<noscript>` rule keeps AOS-hidden content visible if JavaScript is unavailable.
- **Deferred to Phase 10:** the theme toggle button, mobile menu open/close, mega-menu hover-lock on mobile/keyboard, wishlist heart toggling, and the "Shop by Collection" tab switching. These render correctly as static markup (the Luxury tab shows by default; the theme toggle restores a previously-saved preference on load so there's no flash-of-wrong-theme) but don't yet respond to clicks — flagged directly on the page itself with a small inline note so this isn't mistaken for an oversight.

## 4. Verification performed

```
$ node scripts/build.js
[build] Loaded 5 shared component(s): footer, header, mobile-menu, product-card, testimonial-card
[build] Rendered index.html
...
[build] Wrote sitemap.xml with 1 URL(s).
[build] Build complete.
```

Checked programmatically: exactly one `<head>`/`<body>` pair, zero unresolved `{{...}}` template tags, zero missing-component markers, 35 product cards, 4 testimonial slides, all 22 distinct image URLs 200-verified.

**Not yet checked:** actual visual rendering in a browser. This sandboxed shell's loopback network doesn't line up with your machine's real XAMPP Apache instance (port 8080 here resolves to an unrelated EnterpriseDB service, and port 80 isn't reachable from this shell at all), so I could not `curl` `http://localhost/resin/` myself. Please open it in your own browser after pulling these changes — if XAMPP's Apache serves `htdocs` at the standard port, that's `http://localhost/resin/`. Let me know what you see; I'll fix anything that doesn't match the Phase 6 mockup.

---

**Next:** Phase 9 — Remaining Pages (Shop/Collection grid, Product Detail Page, Custom Orders, Cart, Checkout, About, Contact, FAQ, policies, blog, and the `product.template.html`/`collection.template.html` that let `build.js` finally generate real per-product and per-collection pages).
