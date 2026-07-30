# YagnaArts — Phase 7: Folder Structure

**Builds on:** all prior phases, especially [Phase 2 IA](phase-2-information-architecture.md) and [Phase 6 High-Fidelity UI](phase-6-high-fidelity-ui.md)
**Status:** Implemented — real scaffold now exists in the repo, not just documented

---

## 1. The core architecture decision: build-time pre-rendering

You chose **pre-rendered static pages via a small build step** over pure client-side rendering (the alternative: one `product.html?slug=...` template rendered by JS at runtime, zero build tooling). That choice shapes almost everything below, so it's worth restating why it wins for this project specifically:

- **SEO is an explicit hard requirement** (Lighthouse SEO 100, JSON-LD, canonical URLs, clean paths) — pre-rendered HTML is visible to every crawler and social-preview bot without executing JavaScript; query-param SPA pages depend on crawlers executing JS correctly, which is inconsistent outside Googlebot.
- **The catalog is JSON-driven** by your own stated dev principle — a build step is what turns "add a row to JSON" into "a real page exists," with zero HTML hand-authoring per product.
- **Hosting is free-tier** (GitHub Pages / Netlify / Vercel) — all three either run a build step natively (Netlify/Vercel) or can via a free GitHub Actions workflow (GitHub Pages), so this costs nothing to operate.
- **The tradeoff, honestly:** there is now a build step. Node is required to run it (confirmed available in this environment — v24). `npm run watch` removes the friction during local development by rebuilding automatically on save.

---

## 2. Final folder tree

```
/resin
├── /assets
│   ├── /images/{products,collections,hero,testimonials,instagram,blog,brand}
│   ├── /icons
│   └── /videos
├── /css
│   ├── /base        tokens.css ✅, reset.css ✅
│   ├── /layout       (header/footer/grid — Phase 8+)
│   ├── /components   (buttons/cards/forms/modals/navigation/badges — Phase 8+)
│   ├── /pages        (home/shop/product/cart/checkout/blog — Phase 8+)
│   └── main.css ✅   single entry point, ITCSS-ordered imports
├── /js
│   ├── /modules      (theme/cart/wishlist/search/nav/forms — Phase 10)
│   └── main.js       (Phase 10)
├── /src
│   ├── /components   header.html ✅, footer.html ✅, mobile-menu.html ✅
│   ├── /templates    product/collection/blog-post .template.html (Phase 9)
│   └── /pages        home.html + all hand-authored pages (Phase 8/9)
├── /data
│   ├── products.json ✅       (10 seed products spanning multiple collections)
│   ├── collections.json ✅    (all 17 collections, full metadata)
│   ├── testimonials.json ✅
│   └── faq.json ✅
├── /scripts
│   ├── build.js ✅   the static site generator
│   └── watch.js ✅   auto-rebuild on file change
├── /fonts            (self-hosted webfonts — Phase 13)
├── /docs             phase-by-phase planning record (this file included)
├── package.json ✅, .gitignore ✅, README.md ✅
└── (generated at build time, gitignored): index.html, /pages/**, /product/**, /collections/**, /blog/**, sitemap.xml
```

✅ = created and working in this phase. Everything else is intentionally not created yet — building empty CSS/JS stub files with nothing in them would violate the "never generate placeholder code" rule; they get created when the phase that owns them actually has content to put in them.

---

## 3. CSS architecture: why `/css/base /layout /components /pages`

This is an ITCSS-lite ordering: tokens and reset load first (so every later file can rely on custom properties existing), then layout (page skeleton: header/footer/grid), then components (reusable UI: buttons, cards, forms — the pieces that appear on many pages), then pages (the small amount of CSS that's genuinely specific to one template, like the checkout step-indicator). `main.css` is the **only** stylesheet any HTML page ever links to; it `@import`s the rest in the correct cascade order so no page has to remember the right `<link>` order by hand.

`css/base/tokens.css` is a direct, complete implementation of every token from [Phase 4](phase-4-design-system.md) — color, spacing, radius, shadow, motion, z-index — already runnable, not a placeholder.

---

## 4. The component/include system

Three shared fragments now exist in `/src/components`: `header.html` (sticky nav + mega-menus + search overlay), `mobile-menu.html` (accordion-nested mobile nav), and `footer.html` (5-column footer). Any page source in `/src/pages` or any `/src/templates/*.template.html` can pull one in with a marker comment:

```html
<!-- include:header -->
...page-specific content...
<!-- include:footer -->
```

`scripts/build.js` resolves these recursively at build time (so a component can itself include another — `header.html` already includes `mobile-menu.html` this way) and writes the fully assembled, plain static HTML to the real output path. There is exactly one copy of the navbar markup in the entire project, regardless of how many of the ~20 pages use it — directly satisfying your "reusable components, avoid duplicate code" principle without needing a frontend framework.

**Path convention:** all hrefs inside these components are root-relative (`/pages/about.html`, `/collections/wedding-collection/`, etc.) — see the README's "Deployment path note" for what that requires from the eventual host.

---

## 5. The data layer

Four JSON files now exist:

- **`data/products.json`** — 10 real seed products (not placeholders — real names, prices in INR, materials, dimensions, care instructions, and production timelines) spanning Personalized Gifts, Wedding, Home Decor, Pet, Festival, Corporate, Luxury/Limited Edition, Baby, Bookmarks, and Jewelry. Each product's `collections` field is an array, implementing the Phase 2 decision that products aren't locked to one category. Phase 9 expands this into full coverage of all 17 collections.
- **`data/collections.json`** — all 17 collections from the brief, each with a real slug, name, cluster grouping (matching the Phase 2 mega-menu clusters), tagline, and description.
- **`data/testimonials.json`** and **`data/faq.json`** — seed content for the homepage sections designed in Phase 5/6.

## 6. The build script itself

`scripts/build.js` is complete and functional today (verified — see §7), even though most of what it *can* render doesn't exist yet:

1. Loads all `/src/components/*.html` fragments.
2. Renders every page in `/src/pages` by resolving `include:` markers, writing output to the equivalent root path (`home.html` → `/index.html`, everything else → `/pages/...`).
3. Renders `/src/templates/product.template.html` once per `data/products.json` entry using a small built-in mustache-style templating engine (`{{field}}`, `{{#each array}}`, `{{#if field}}`) — no templating library dependency.
4. Same for collections and blog posts.
5. Writes `sitemap.xml` from every URL actually generated, ready for Phase 12 to extend.

Templates/pages that don't exist yet are skipped with a clear console notice rather than crashing — confirmed by running `node scripts/build.js` against the current (mostly seed-only) tree.

---

## 7. Verification

```
$ node scripts/build.js
[build] Loaded 3 shared component(s): footer, header, mobile-menu
[build] No hand-authored pages in /src/pages yet — nothing to render (expected until Phase 8/9).
[build] No /src/templates/product.template.html yet — skipping product page generation (Phase 9).
[build] No /src/templates/collection.template.html yet — skipping collection page generation (Phase 9).
[build] No /src/templates/blog-post.template.html yet — skipping blog generation (Phase 9).
[build] Wrote sitemap.xml with 1 URL(s).
[build] Build complete.
```

The pipeline runs cleanly end-to-end today. Phase 8 adds `src/pages/home.html`, runs the build, and for the first time `index.html` exists and is viewable at `http://localhost/resin/` via XAMPP.

---

**Next:** Phase 8 — Homepage Development. This will author `src/templates` are not needed yet for the homepage itself (it's hand-authored, not data-generated), but `src/pages/home.html` will be built using the header/footer components already in place, the hi-fi design proven in Phase 6, and the seed product/testimonial/FAQ data now sitting in `/data`.
