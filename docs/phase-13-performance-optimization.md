# YagnaArts — Phase 13: Performance Optimization

**Builds on:** the whole site as of Phase 12
**Status:** Implemented

---

## 1. Font optimization — self-hosted, not CDN

Every page was loading Playfair Display, Poppins, and Cormorant Garamond from `fonts.googleapis.com`, which costs a full extra DNS+TLS round-trip to a third-party origin before any text can render in its real font. That's now gone, replaced with `css/base/fonts.css`: seven `@font-face` declarations pointing at real, Latin-subset `.woff2` files in `/fonts/`, `font-display: swap` on every one (so text is never invisible while fonts load — it shows in a fallback font, then swaps).

Only the weight/style pairs actually used anywhere in the site's CSS are included (verified by checking, not guessed): Playfair Display 700 normal + 600 italic, Poppins 400/500/600/700 normal, Cormorant Garamond 400 italic. All seven files were downloaded from Google's own font CDN, so they're byte-identical to what the CDN was serving — nothing about the typography changed, only where it loads from.

Each page's `<head>` now also **preloads** the two files that matter most for the largest above-the-fold text — the heading font and the body font — via `<link rel="preload" as="font">`, so the browser fetches them immediately instead of discovering they're needed only after parsing the CSS.

**Verified:** wrote a script that checks every path referenced in `fonts.css` actually resolves to a real file on disk — all 7 confirmed present.

## 2. Removed an entirely unused ~80KB script

Every page was loading `bootstrap.bundle.min.js` (Bootstrap's JS plugins + Popper) from Phase 8 onward. Checked whether anything in the site actually uses it — grepped the whole `src/` tree for `data-bs-` (the attribute Bootstrap's JS looks for to activate dropdowns/modals/collapses/etc.): **zero matches**. Every interactive component on this site (mega-menu, mobile menu, tabs, accordion) was built with custom vanilla JS in Phase 10 specifically, using native `<details>` where possible — Bootstrap's JS was never actually wired to anything. Removed the script tag from all 22 page sources. Bootstrap's CSS (grid/utilities) and Bootstrap Icons (icon font) are still used and stay.

## 3. Preconnect hints, completed

`images.pexels.com` (every page's largest images load from here) and `cdn.jsdelivr.net` (Bootstrap CSS/Icons, and AOS/Swiper/GSAP on the homepage) now get `<link rel="preconnect">` on **every** page — previously only the homepage had the jsdelivr one, and none had Pexels. Verified via script that all 22 page sources have both after the fix (one file — `home.html` — briefly had a duplicate from the bulk edit, since it already had one; caught and removed on re-check).

## 4. Image loading — audited, one real gap found and fixed

Every non-hero image across the site already had `loading="lazy"` from Phases 8–9 (verified: zero images found without either `loading="lazy"` or the intentional `fetchpriority="high"` hero exception). Auditing `width`/`height` (needed to reserve layout space and prevent Cumulative Layout Shift) turned up a real gap: **the 4 blog post hero images had no dimensions at all** — fixed in `blog-post.template.html`. Re-swept after rebuilding: zero images anywhere in the generated output now lack `width`/`height`.

## 5. Two things deliberately *not* done, and why

- **Hand-rolled minification.** No bundler exists in this project by design (zero-dependency static site), and every serious free host (Netlify, Vercel, Cloudflare Pages) automatically minifies and Brotli/gzip-compresses text assets at deploy/edge time regardless of source formatting — that compression alone typically cuts CSS/JS transfer size 70-80%, dwarfing what manual whitespace-stripping would save on files this small. Writing a regex-based minifier risked silently breaking CSS or JS for a gain the hosting platform already provides for free. Phase 15's deployment guide will confirm which auto-minify/compression setting to enable per host.
- **Deferring Bootstrap/Icons CSS further.** These remain deliberately render-blocking. They're small, necessary for correct initial layout, and browsers cache Bootstrap CSS from `cdn.jsdelivr.net` across the many other sites that use the same CDN URL — deferring them (e.g. via a `media="print" onload` swap trick) would trade a small render-blocking cost for a real risk of FOUC/layout shift, which hurts Core Web Vitals more than it helps.

## 6. Verification performed

- Rebuilt the full site after every change; swept for leftover template tags — zero found each time.
- Scripted checks (not manual eyeballing) for: every page referencing `main.js`, zero remaining Google Fonts/Bootstrap-JS references, every page having both new preconnect hints, zero duplicate preconnects, zero images missing `width`, all 7 font file paths resolving on disk.
- `node --check` was already clean on all JS from Phase 10/11; nothing in this phase touched JS logic, only `<head>` markup and one new CSS file.

---

**Next:** Phase 14 — Testing Checklist. This phase also carries forward two open items to verify: the missing visible breadcrumbs on About/Contact/FAQ/policy pages (flagged in Phase 12), and an actual browser click-through of every interactive feature (flagged since Phase 8, still unverified in a real browser due to this sandbox's networking limits).
