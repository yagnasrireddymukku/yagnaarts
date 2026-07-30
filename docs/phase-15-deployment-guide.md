# YagnaArts — Phase 15: Deployment Guide

**Builds on:** the complete site as of Phase 14
**Status:** Implemented — deployment configs are real and ready; going live requires your own account/domain decisions below

---

## 1. Hosting recommendation

Every shared component (`header.html`, `footer.html`, `mobile-menu.html`) uses **root-relative paths** (`/css/main.css`, `/collections/...`, `/product/...`) — a deliberate Phase 7 decision to keep the codebase simple. This works perfectly on a host that serves from a true domain root, and needs one extra step on a host that doesn't:

| Host | Root-relative paths work out of the box? | Runs `npm run build` automatically? |
|---|---|---|
| **Netlify** (recommended) | Yes | Yes — just point it at the repo |
| **Vercel** | Yes | Yes |
| **Cloudflare Pages** | Yes | Yes |
| **GitHub Pages + custom domain** | Yes | No — needs the included Actions workflow |
| **GitHub Pages, `username.github.io/repo/` (no custom domain)** | **No** — every root-relative link would 404 | No |

**Recommendation: Netlify.** It's free at this scale, serves from a true root, auto-detects `npm run build`, and `netlify.toml` (already written) configures it completely — connecting the repo is the only manual step. Vercel and Cloudflare Pages are equally valid; the setup steps below are nearly identical for all three. GitHub Pages is fully supported too (via the included `deploy-gh-pages.yml` workflow) but **only** if you attach a custom domain — the bare `username.github.io/resin/` path would break every internal link.

---

## 2. Before your first deploy — three things only you can decide

### A. Set your real domain

Every canonical URL, Open Graph tag, and JSON-LD block was written against the placeholder `https://www.yagnaarts.com` (in `scripts/build.js`'s `SITE_URL` constant, and literally in 15 hand-authored page sources — see Phase 9/12 for why those aren't templated). Once you know your real domain (or your Netlify/Vercel subdomain, if launching before buying a custom domain):

```bash
node scripts/set-site-url.js https://your-real-domain.com
```

This updates all 15 files and the `SITE_URL` constant in one pass — written specifically for this phase rather than asking you to find-and-replace by hand. Also update `robots.txt`'s `Sitemap:` line to match (one line, not scripted — it's the only remaining reference this script doesn't touch since it's outside `/src`).

### B. Fill in `js/config.js` (Phase 11)

The EmailJS/Google Sheets/WhatsApp placeholders in `js/config.js` — see [Phase 11](phase-11-forms-integration.md) for the exact setup steps. The site works and forwards leads via WhatsApp even before this is done, but Sheets logging and email notifications stay silent until it is.

### C. Real social profile links

`footer.html`/`mobile-menu.html` still have `#` placeholders for Instagram/Facebook/YouTube/Pinterest. Once real profiles exist, update both files **and** add `sameAs` back into the homepage's Organization JSON-LD (deliberately left out in Phase 12 to avoid publishing fake URLs).

---

## 3. Netlify setup (recommended path)

1. Push this repo to GitHub/GitLab/Bitbucket.
2. [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project** → pick the repo.
3. Netlify reads `netlify.toml` automatically — build command `npm run build`, publish directory `.` are already set. Click **Deploy**.
4. Once live, **Domain settings** to add your custom domain (free SSL is automatic).
5. Every future `git push` to your main branch rebuilds and redeploys automatically.

## 4. Alternative: Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
2. Framework preset: "Other". Build command: `npm run build`. Output directory: `.` (repo root).
3. Deploy. Add a custom domain under **Settings → Domains** the same way.

## 5. Alternative: Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Build command: `npm run build`. Build output directory: `/` (repo root).
3. Deploy. Custom domains attach under the project's **Custom domains** tab.

## 6. Alternative: GitHub Pages (only with a custom domain)

1. Repo **Settings → Pages → Source: GitHub Actions**.
2. The included `.github/workflows/deploy-gh-pages.yml` builds and publishes on every push to `main` — no further config needed.
3. **Settings → Pages → Custom domain**, add your domain, and point its DNS at GitHub Pages (an `A` record to GitHub's IPs, or a `CNAME` record if using a subdomain — GitHub's own docs list the current IPs).
4. Do **not** use this host without a custom domain attached — see the table in §1.

## 7. DNS, in general

Whichever host you pick, your domain registrar needs either：a `CNAME` record pointing your domain (or `www` subdomain) at the host's provided address, or an `A`/`ALIAS` record if using a bare apex domain — each host's dashboard shows the exact record once you add the domain there. Propagation typically takes minutes to a few hours.

## 8. Analytics & Search Console (free, per the original brief)

- **Google Analytics**: create a GA4 property, get the Measurement ID, and add the standard GA4 snippet to `src/components/header.html` (or a new shared `analytics.html` partial) so it appears on every page via the existing include system — not done yet, since it needs your real GA4 ID.
- **Google Search Console**: verify domain ownership (DNS TXT record or an HTML file host-shows you), then submit `https://your-domain.com/sitemap.xml` (already generated by every build — see Phase 12).

---

## 9. Consolidated go-live checklist

Pulling together every "you still need to do this" item accumulated since Phase 8:

- [ ] Run `node scripts/set-site-url.js https://your-real-domain.com` and update `robots.txt`'s `Sitemap:` line
- [ ] Fill in `js/config.js` — EmailJS credentials, Google Sheets Web App URL, real WhatsApp number (Phase 11)
- [ ] Update the real WhatsApp number in `footer.html`/`mobile-menu.html` to match `js/config.js`
- [ ] Replace `#` social links in `footer.html`/`mobile-menu.html` once real profiles exist, and add `sameAs` to the homepage Organization JSON-LD
- [ ] Connect the repo to Netlify (or your chosen host) and deploy
- [ ] Attach your custom domain + verify SSL is active
- [ ] Add GA4 tracking and verify Search Console, submit the sitemap
- [ ] Manual browser QA from [Phase 14 §5](phase-14-testing-checklist.md#5-what-still-requires-an-actual-browser-manual--cannot-be-scripted-from-here): full purchase flow, theme/menu/tabs interaction, a screen reader pass, real-device check
- [ ] Run a real Lighthouse audit against the live URL and compare to the Performance 95+/Accessibility 100/SEO 100/Best Practices 100 targets
- [ ] Submit each form once with real config and confirm the Sheet row + email actually arrive

---

## 10. What this 15-phase build produced

Business analysis and IA (Phases 1–2) → brand identity and design system (Phases 3–4) → wireframes and a working high-fidelity mockup (Phases 5–6) → a real zero-dependency static-site-generator architecture (Phase 7) → a fully built, generated 50-page site with a real JSON product catalog (Phases 8–9) → working cart/wishlist/search/checkout/theme (Phase 10) → real form-to-Sheets/EmailJS/WhatsApp integration code (Phase 11) → structured data and social previews across every page (Phase 12) → self-hosted fonts and dead-code removal (Phase 13) → a scripted accessibility/QA pass that caught and fixed a real WCAG contrast bug (Phase 14) → and now a deployable, documented path to production. Every phase's doc lives in `/docs` as the permanent record of what was built and why.
