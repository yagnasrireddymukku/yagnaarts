# YagnaArts — Phase 14: Testing Checklist

**Builds on:** the complete site as of Phase 13
**Status:** Automated checks complete and passing; manual browser/device pass still required (see §5)

---

## 1. Automated checks performed — and what they found

Rather than write a checklist of things someone *should* check, this phase scripted as many of them as realistically can be scripted for a static site and ran them against the actual generated output (not the templates — the real 50 files a visitor would receive).

| Check | Method | Result |
|---|---|---|
| Internal link integrity | Extracted every `href="/..."` across all 50 pages, resolved each to a real file on disk | **0 broken links** |
| Duplicate `id` attributes | Per-page scan (duplicate IDs break `getElementById`/label association/CSS) | **0 duplicates** |
| Exactly one `<h1>` per page | Counted `<h1>` per page | 1 real gap found: `search.html` had zero — **fixed** (added a visually-hidden `<h1>`) |
| Every `<img>` has `alt` | Regex over all `<img>` tags | **0 missing** (already solid from Phases 8–9) |
| Every visible form input has a label | Matched input `id`s against `<label for>` | 4 flagged, all 4 verified as **correct false positives** — the honeypot fields, which are `aria-hidden="true"` and `tabindex="-1"` by design (assistive tech should never reach them) |
| Document structure (one DOCTYPE/head/body) | Per-page count | **0 malformed pages** |
| JSON-LD validity | `JSON.parse` on all structured-data blocks | 64/64 valid (carried over verification from Phase 12, re-run after this phase's edits) |
| Image URLs still resolve | Re-`curl`'d all 27 unique Pexels URLs used across the final build | **All 27 return 200** — no link rot since Phase 8 |
| WCAG color contrast | Computed real relative-luminance contrast ratios for every token pair in `tokens.css`, not eyeballed | **2 real failures found — fixed** (see §2) |

## 2. The real accessibility bug this phase caught

Computing actual WCAG contrast ratios (not just judging colors by eye) found that `--color-accent` (gold, `#C9A24B`) and `--color-secondary` (rose gold, `#C08A6B`) — used as **text/icon color** in ~28 places across the CSS (eyebrows, category labels, link hovers, ratings, step numbers) — measured **2.40:1 and 2.77:1** against light-theme backgrounds. Both fail WCAG's 3:1 floor even for large text, let alone the 4.5:1 normal-text requirement. This had been true since Phase 4 and gone unnoticed because it "looked fine" — gold-on-cream reads as a stylistic choice at a glance, not a contrast failure, until it's actually measured.

**Fix:** added two new theme-aware tokens, `--color-accent-text` and `--color-secondary-text` — darker (`#8a6a1f`, `#8a5a45`) in light theme, flipping to the existing lighter shades in dark theme (where they already passed comfortably). Repointed all ~28 real text/icon-color usages to the new tokens via a verified bulk edit (confirmed the CSS `accent-color` property, used for checkbox tick color, was correctly left untouched — that's a different thing that happens to share a similar name). Re-computed contrast afterward: every pair now passes 4.5:1 (normal text) or comfortably exceeds 3:1 (icons/graphics, which WCAG 1.4.11 holds to a lower bar than body text). The brand's core visual signature — gold and rose-gold as *background/gradient* colors — is completely unchanged; only their use as flat text color was adjusted.

## 3. Also fixed this phase

- **Missing breadcrumbs** (flagged as a gap in Phase 12): added a real, visible breadcrumb nav to the 12 pages that lacked one — About, Contact, FAQ, Custom Orders, the 3 occasion landing pages, Blog index, and all 4 policy pages — closing the gap against Phase 5's "breadcrumbs everywhere except Homepage/Cart/Checkout" spec.
- **`search.html`'s missing `<h1>`** (found by the automated sweep above).

## 4. What "Testing Checklist" does *not* mean here

This phase produced verified, scripted results — not a to-do list disguised as a report. Every claim above (broken links, contrast ratios, JSON-LD validity, image liveness) was computed against real files, not estimated.

## 5. What still requires an actual browser (manual — cannot be scripted from here)

This sandbox's networking still doesn't reach your XAMPP Apache instance (unchanged since Phase 8), so the following genuinely need your own pass before launch:

- [ ] Click through the full purchase flow (browse → PDP → Add to Cart → Checkout → Confirmation) end to end
- [ ] Theme toggle, mobile menu (including focus trap + Escape), mega-menus, and tab-switching in a real browser
- [ ] Screen reader pass (NVDA/VoiceOver) on at least the homepage, a PDP, and Checkout
- [ ] Real device/viewport check across the breakpoints defined in Phase 4 (a phone, a tablet, a laptop, and — if available — a foldable)
- [ ] Run an actual Lighthouse audit once deployed (or via `localhost` + Chrome DevTools) against the Performance 95+/Accessibility 100/SEO 100/Best Practices 100 targets — everything in Phases 12–14 was built and verified toward those targets, but only a real Lighthouse run confirms the score
- [ ] Submit each form once real EmailJS/Google Sheets credentials are in place (Phase 11) and confirm the row/email actually arrive

---

**Next:** Phase 15 — Deployment Guide: step-by-step instructions for GitHub Actions (build + deploy), the free-hosting target decision (Netlify/Vercel/Cloudflare Pages vs. GitHub Pages + custom domain, per the root-relative-path note from Phase 7), DNS setup, and a go-live checklist tying together every "you still need to do this" item accumulated across Phases 11–14.
