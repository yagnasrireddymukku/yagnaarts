# YagnaArts

Premium handmade resin art e-commerce platform. Static HTML5 / CSS3 / Bootstrap 5 / vanilla ES6+ frontend, with a small zero-dependency Node build step that pre-renders SEO-friendly static pages from a JSON product catalog.

Full planning documentation lives in [`/docs`](docs/) — start with [`docs/phase-1-business-analysis.md`](docs/phase-1-business-analysis.md) and read forward; each phase builds on the last.

## Quick start (local development via XAMPP)

This project already lives in an XAMPP `htdocs` folder, so Apache serves it directly at `http://localhost/resin/` — no separate dev server needed. You only need Node.js locally to run the **build step**, which turns the source in `/src` and `/data` into real static HTML files at the project root.

```bash
npm run build     # one-time build
npm run watch     # rebuilds automatically whenever /src or /data change
```

Run one of these once before opening the site in a browser — the root `index.html`, `/pages/*.html`, `/product/**`, `/collections/**`, and `/blog/**` are **build output** and are not committed to version control (see `.gitignore`); they don't exist until you build.

## Why there's a build step at all

This is a static site with no server-side rendering, deployed to free hosts (GitHub Pages / Netlify / Vercel). But the product catalog is JSON-driven (so products/collections can be added without hand-writing HTML), and SEO is a hard requirement (real `<title>`/meta description/canonical URL/JSON-LD per product, clean URLs, crawlable without executing JS). Client-side-only rendering (one template + `?slug=` query params) can't deliver that. So `scripts/build.js` reads `/data/*.json` and `/src/templates/*.template.html`, and writes one real static HTML file per product, collection, and blog post — see [`docs/phase-7-folder-structure.md`](docs/phase-7-folder-structure.md) for the full reasoning and the alternative that was considered.

The same build step also inlines the shared header/footer/mobile-menu components (from `/src/components`) into every page, so there's exactly one source of truth for site chrome even though the deployed output has no framework and no client-side includes.

## Project structure

```
/assets            Images, icons, videos — organized by usage (products, collections, hero, etc.)
/css
  /base            tokens.css (design system custom properties), reset.css
  /layout          header/footer/grid — added as authored (Phase 8+)
  /components      buttons/cards/forms/modals/navigation/badges — added as authored
  /pages           per-template overrides (home/shop/product/cart/checkout/blog)
  main.css         single entry point — the only stylesheet every page links to
/js
  /modules         one file per feature (theme, cart, wishlist, search, nav, forms...) — Phase 10
  main.js          entry point
/data              products.json, collections.json, testimonials.json, faq.json, blog-posts.json
/src
  /components      header.html, footer.html, mobile-menu.html — shared fragments
  /templates       product.template.html, collection.template.html, blog-post.template.html
  /pages           hand-authored page sources (home.html, about.html, contact.html, ...)
/scripts
  build.js         the static site generator described above
  watch.js         re-runs build.js on file changes during local development
/fonts             self-hosted webfonts (Phase 13)
/docs              phase-by-phase planning documents (business analysis through deployment)

# Generated at build time — gitignored, not hand-edited:
/index.html, /pages/*.html, /product/{slug}/index.html,
/collections/{slug}/index.html, /blog/{slug}/index.html, /sitemap.xml
```

## Adding a product

Add an entry to `data/products.json` (see the existing entries for the schema) and run `npm run build`. A new static page appears at `/product/{slug}/index.html` automatically — no HTML to write by hand. The same is true for collections (`data/collections.json`) and blog posts (`data/blog-posts.json`).

## Deployment

Shared components use root-relative paths (`/css/main.css`, `/collections/...`, etc.), which assumes the site is served from a true domain root. This works out of the box on **Netlify, Vercel, and Cloudflare Pages**, and on **GitHub Pages with a custom domain**. A GitHub Pages *project* site without a custom domain (`username.github.io/resin/`) would need either a `<base>` tag adjustment or a custom domain.

Ready-to-use deployment configs already exist: `netlify.toml` (recommended host), `.github/workflows/ci.yml` (build validation on every push), and `.github/workflows/deploy-gh-pages.yml` (optional, GitHub Pages only). Before your first deploy, run `node scripts/set-site-url.js https://your-real-domain.com` to replace the placeholder domain baked into canonical/OG/JSON-LD tags. Full walkthrough, DNS setup, and a consolidated go-live checklist: [`docs/phase-15-deployment-guide.md`](docs/phase-15-deployment-guide.md).

## Tech stack

HTML5, CSS3 (custom properties + Bootstrap 5 grid/utilities), vanilla JavaScript ES6+, Bootstrap Icons, AOS, SwiperJS, GSAP. No React/Angular/Vue/jQuery, per project requirements. See `docs/` for the full brand, design system, and architecture rationale.
