# YagnaArts — Phase 9: Remaining Pages

**Builds on:** all prior phases, especially [Phase 7 Folder Structure](phase-7-folder-structure.md) and [Phase 8 Homepage Development](phase-8-homepage-development.md)
**Status:** Implemented — the site now has 50 real generated pages

---

## 1. What was built

**The two templates that activate the Phase 7 build pipeline:**
- `src/templates/product.template.html` — full PDP: image gallery, price/customization/production-time block, quantity stepper, Add to Cart/Buy Now, a tab set (Description/Specifications/Care/Reviews) reusing the homepage's tab component, related products (computed at build time from shared collections), a Recently Viewed slot, and a mobile sticky buy bar.
- `src/templates/collection.template.html` — collection hero (using each collection's real `heroImage`), filter sidebar, sort control, and the product grid — one template serving all 17 collections.
- `src/templates/blog-post.template.html` — post hero, meta (author/date/reading time), body content, and related-posts-by-category.

Running the build now generates **10 product pages, 17 collection pages, and 4 blog posts** — all real, pre-rendered, crawlable static HTML, exactly as scoped in Phase 7's architecture decision.

**Hand-authored pages:** Shop (master catalog), Cart, Wishlist, Checkout + Confirmation, Custom Orders, About, Contact, FAQ, Search, three occasion landing pages (Wedding/Corporate/Festival Gifting), four policy pages (Shipping & Returns, Care Instructions, Privacy Policy, Terms of Service), and the Blog index.

**New reusable partials** (extending Phase 8's pattern): `product-card.html`, `testimonial-card.html`, and now `blog-post-card.html` — one source file each, reused across dozens of pages.

## 2. Real content, not filler

Four blog posts (~400-600 words each) were written with specific, checkable claims (wedding return-gift ordering advice, resin care specifics, Diwali corporate-gifting timing, 2026 decor trends) rather than generic filler, per the project's no-lorem-ipsum mandate. The four policy pages contain real operating terms consistent with everything established in Phases 1–8: personalized items can't be returned for change-of-mind but are remade/refunded for defects or proof mismatches (this traces directly back to the Phase 1 trust-gap analysis), flat ₹99 shipping free over ₹2,500, and the WhatsApp/email payment-confirmation flow already shown on the Checkout page.

## 3. Two build-engine improvements made along the way

- **`{{#if}}` now treats an empty array as falsy.** Plain JS truthiness treats `[]` as true, which would have rendered an empty "Related Reading" heading with nothing under it on every blog post (none of the 4 seed posts share a category yet, so every `relatedPosts` array is empty today). Fixed in `build.js` and verified — the section now correctly disappears when there's nothing to show.
- **`curatedList()` helper** (added in Phase 8, reused throughout Phase 9): every product row leads with explicitly badged items and tops up from the rest by rating, so thin badge coverage in the seed catalog never produces a visibly sparse row.

## 4. Two real inconsistencies caught by rebuilding after every batch

Three occasion landing pages (Wedding/Corporate/Festival Gifting) and the Blog index initially used `.shop-hero` / `.shop-collection-chip` classes from `shop.css` without linking that stylesheet — copy-paste from other templates that happened to already have it. Caught by visually re-reading each page after generation, not by the build script (a missing stylesheet link doesn't break the build, it just silently fails to style) — fixed all four before moving on. This is a good argument for Phase 14's testing checklist to include a "does every page link every stylesheet its classes require" pass.

## 5. What's still static/inert (by design, per your own phase order)

Every form on these 20 new pages (Contact, Custom Orders, Wedding/Corporate inquiry, Checkout) is fully built with real fields, labels, and honeypot spam traps — but submission logic is explicitly Phase 11's job, and step-navigation/filtering/sorting/tab-switching is Phase 10's. Each page says so inline (small muted notes) rather than silently shipping something that looks broken.

## 6. Verification performed

```
$ node scripts/build.js
...
[build] Generated 10 product page(s).
[build] Generated 17 collection page(s).
[build] Generated 4 blog post page(s).
[build] Wrote sitemap.xml with 50 URL(s).
[build] Build complete.
```

Swept **every** generated HTML file (not just a sample) for leftover `{{...}}` template tags and missing-component markers: zero found across all 50 pages. Spot-checked a blog post's title/meta tags and confirmed the related-posts fix suppresses correctly.

---

**Next:** Phase 10 — JavaScript Features. This is where every "activates in Phase 10" note scattered through this phase's pages gets wired up for real: theme toggle persistence, mobile menu + mega-menu interaction, tab switching, cart/wishlist (LocalStorage-backed), live search, shop filter/sort, checkout step navigation, and PDP gallery/sticky-bar behavior.
