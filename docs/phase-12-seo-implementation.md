# YagnaArts — Phase 12: SEO Implementation

**Builds on:** the build pipeline from [Phase 7](phase-7-folder-structure.md), content from [Phases 8–9](phase-9-remaining-pages.md)
**Status:** Implemented

---

## 1. Structured data (JSON-LD)

Computed in `scripts/build.js` (as pre-serialized JSON strings injected via `{{{...}}}`, since the templating engine's `{{#each}}`/`{{#if}}` isn't suited to arbitrary nested JSON) and verified valid on **every single generated page**:

- **Product** schema on all 10 product pages — name, images, description, SKU, brand, `Offer` (price/currency/availability), `AggregateRating`. `availability` maps `limited-stock` → schema.org `LimitedAvailability`, everything else → `InStock`.
- **CollectionPage** schema on all 17 collection pages.
- **BlogPosting** schema on all 4 posts — headline, image, author, publish date.
- **BreadcrumbList** schema on product/collection/blog pages, generated from the same data used to render the visible breadcrumb (so structured data can never drift from what a visitor actually sees).
- **Organization** + **WebSite** (with a `SearchAction` pointing at `/pages/search.html?q={search_term_string}`, wiring the site's real search into Google's sitelinks-search-box eligibility) on the homepage.

**One deliberate omission:** `Organization.sameAs` (the field that lists real social profile URLs) is left out with an explanatory comment rather than populated, because the social links in `footer.html` are still `#` placeholders — publishing fake sameAs URLs would be worse than publishing none. Add real Instagram/Facebook links to both places together once they exist.

## 2. Open Graph & Twitter Cards

Every indexable page — all 10 products, 17 collections, 4 blog posts, the homepage, and all 12 remaining indexable hand-authored pages (Shop, About, Contact, Custom Orders, FAQ, the 3 occasion landing pages, Blog index, 4 policy pages) — now has `og:type/title/description/image/url/site_name` and matching `twitter:card/title/description/image` tags. For the 12 hand-authored pages, these were derived directly from each page's own `<title>`/description text plus whatever Pexels image was already referenced on that page (falling back to a default studio image where a page had none) — verified with a script that confirmed every non-noindex page ended up with `og:title` present, not just assumed.

**Deliberately excluded:** the 5 `noindex` utility pages (Cart, Wishlist, Checkout, Checkout Confirmation, Search) — these only ever show personal/session state, so there's nothing meaningful to preview if shared, and OG tags there would just be clutter.

## 3. `robots.txt` and the sitemap

`robots.txt` is a plain static file at the project root (it never varies with data, so unlike `sitemap.xml` it isn't build-generated) — allows everything by default, explicitly disallows the non-content directories (`/src/`, `/scripts/`, `/docs/`, `/data/`) and the 5 noindex utility pages, and points to the sitemap.

**A real bug caught while verifying this phase:** `sitemap.xml` (generated since Phase 7) was including all 50 rendered URLs indiscriminately — including the 5 `noindex` pages, which contradicts the entire point of marking them noindex. Fixed `build.js` to check each rendered page's own `<meta name="robots" content="noindex">` tag before adding it to the sitemap. Verified: sitemap now lists exactly 45 URLs, and a grep for `cart|checkout|wishlist|search` against the regenerated file confirms zero matches.

## 4. What was already in place from earlier phases

Canonical URLs, unique per-page `<title>`/meta descriptions, a logical single-`<h1>`-per-page heading structure, and descriptive image `alt` text were already established in Phases 8–9 — this phase's job was structured data, social preview tags, and the crawl-control files, not redoing that groundwork.

## 5. A gap worth flagging for Phase 14

Not every hand-authored page has a *visible* breadcrumb (product/collection/blog pages do; About/Contact/FAQ/policy pages currently don't) — per Phase 5's wireframe spec, breadcrumbs should appear everywhere except Homepage/Cart/Checkout. I deliberately didn't add `BreadcrumbList` JSON-LD to pages without a matching visible breadcrumb (structured data should never claim something the page doesn't actually show), but the missing visible breadcrumbs themselves are a real, if minor, UX completeness gap. Flagging it for Phase 14's testing checklist rather than scope-creeping a UI change into an SEO phase.

## 6. Verification performed

- Rebuilt the full site; swept **all** generated HTML for leftover `{{...}}` template tags — zero found.
- Parsed all 64 JSON-LD `<script>` blocks across every generated page with `JSON.parse` — all valid.
- Scripted a check confirming every non-noindex page has `og:title` — after fixing one miss (`shop.html`), zero remain.
- Confirmed `sitemap.xml` excludes all 5 noindex pages after the fix above.

---

**Next:** Phase 13 — Performance Optimization: lazy loading, deferred/critical CSS, font optimization (self-hosting the Google Fonts currently loaded via CDN, with `font-display: swap` and preloading), image optimization, and minification — working toward the Lighthouse 95+/100/100/100 targets from the original brief.
