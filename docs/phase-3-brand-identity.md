# YagnaArts — Phase 3: Brand Identity

**Builds on:** [Phase 1](phase-1-business-analysis.md) · [Phase 2](phase-2-information-architecture.md)
**Status:** Draft for approval

---

## 1. Logo Direction

No existing logo asset exists, so the platform will ship with a **CSS/SVG wordmark** (built in code, not an image file) — fully crisp at any resolution, themeable, and zero-load-cost:

- **Primary mark:** `YagnaArts` set in Playfair Display (see §3), letter-spaced, with "Yagna" in full weight and "Arts" in a lighter/italic weight to suggest the founder-name + craft-discipline pairing.
- **Icon glyph:** a single abstract resin-drop / pour mark (simple SVG, one continuous curved path with a subtle highlight) placed before the wordmark — reads as a droplet or a brushstroke depending on viewing distance. Renders in gold on dark surfaces, deep sapphire on light surfaces.
- **Lockups needed:** horizontal (navbar), stacked (footer/mobile splash), icon-only (favicon/app icon/PWA).
- **Future option:** once budget allows, this CSS wordmark can be replaced 1:1 by a commissioned illustrated logo without touching layout — the header component will reference a single `.logo` slot.

---

## 2. Color System

Inspired by: Crystal Resin, Ocean Resin, Gold Leaf, Pearl White, Royal Blue, Rose Gold, Emerald, Luxury Black, Soft Beige.

### 2.1 Core Palette

| Token | Name | Hex | Use |
|---|---|---|---|
| `--color-primary` | Royal Sapphire (Ocean Resin) | `#0E3A5F` | Primary brand color — headers, primary buttons (light theme), links |
| `--color-primary-light` | Ocean Resin Light | `#1E6091` | Hover states, gradients |
| `--color-secondary` | Rose Gold | `#C08A6B` | Secondary accents, wishlist/heart, wedding/gifting sections |
| `--color-accent` | Gold Leaf | `#C9A24B` | CTAs, badges, price highlights, luxury accents |
| `--color-accent-light` | Gold Leaf Light | `#E8C874` | Gradient stop, hover glow |
| `--color-emerald` | Emerald | `#0F6B4C` | Success states, festival/luxury tags, in-stock indicators |
| `--color-pearl` | Pearl White | `#FAF7F2` | Light theme background |
| `--color-beige` | Soft Beige | `#EFE6D8` | Light theme secondary surface, card backgrounds |
| `--color-luxury-black` | Luxury Black | `#0D0D10` | Dark theme background |
| `--color-charcoal` | Charcoal Surface | `#17171B` | Dark theme card/surface |

### 2.2 Gradients

```css
--gradient-ocean:   linear-gradient(135deg, #0E3A5F 0%, #1E6091 100%);
--gradient-gold:    linear-gradient(135deg, #C9A24B 0%, #E8C874 100%);
--gradient-rosegold: linear-gradient(135deg, #C08A6B 0%, #E7B7A3 100%);
--gradient-hero-light: linear-gradient(120deg, #FAF7F2 0%, #EFE6D8 45%, #E8C874 100%);
--gradient-hero-dark:  linear-gradient(120deg, #0D0D10 0%, #14202B 55%, #0E3A5F 100%);
--gradient-glass:   linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.05));
```

Used for: hero background wash, section dividers, premium product badges ("Limited Edition," "Luxury Collection"), CTA button fills.

### 2.3 Light Theme

| Token | Hex | Role |
|---|---|---|
| `--bg-body` | `#FAF7F2` | Page background |
| `--bg-surface` | `#FFFFFF` | Cards, modals, nav |
| `--bg-surface-alt` | `#EFE6D8` | Alternating sections |
| `--text-primary` | `#1A1A1D` | Headings, body |
| `--text-muted` | `#5B5850` | Secondary text, captions |
| `--border-subtle` | `#E4DCCC` | Card borders, dividers |

### 2.4 Dark Theme

| Token | Hex | Role |
|---|---|---|
| `--bg-body` | `#0D0D10` | Page background |
| `--bg-surface` | `#17171B` | Cards, modals, nav |
| `--bg-surface-alt` | `#1E1E23` | Alternating sections |
| `--text-primary` | `#F5F1E8` | Headings, body |
| `--text-muted` | `#B8B2A6` | Secondary text, captions |
| `--border-subtle` | `#2A2A30` | Card borders, dividers |

Gold (`#C9A24B`) and Rose Gold (`#C08A6B`) are the two colors held constant across both themes — they are what make dark mode feel premium rather than just "inverted," since gold-on-black is a classic luxury signal.

### 2.5 Buttons & Interactive States

| Element | Light Theme | Dark Theme |
|---|---|---|
| Primary button (Add to Cart) | Fill: `--gradient-ocean`, text white; hover: darken 8% + gold glow shadow | Fill: `--gradient-gold`, text `#0D0D10`; hover: brighten + sapphire glow shadow |
| Secondary/outline button (Buy Now, Wishlist toggle) | 1.5px border `--color-accent`, transparent fill, text `--color-primary` | 1.5px border `--color-accent`, transparent fill, text `--color-pearl` |
| Disabled | 40% opacity, no shadow, `cursor: not-allowed` | same |
| Focus-visible | 3px outline `--color-accent`, 2px offset (WCAG 2.2 requirement) | same |

---

## 3. Typography

| Role | Font | Rationale |
|---|---|---|
| Display / Headings (H1–H3) | **Playfair Display** (serif) | Editorial, high-contrast serif — the visual signature of luxury/fashion D2C brands; used for hero headlines, section titles, product names |
| Body / UI text | **Poppins** (sans-serif) | Clean, highly legible at small sizes, geometric-modern, wide weight range (300–700) for hierarchy without a second family |
| Accent / Pull-quotes / Signature | **Cormorant Garamond** (italic) | Testimonials, founder-story pull quotes, "Handcrafted with Love" taglines — softer and more intimate than Playfair |

Both are free Google Fonts, self-hosted (Phase 13 performance: `font-display: swap`, subset to Latin, preloaded for headings only).

**Scale (fluid, `clamp()`-based, finalized in Phase 4 Design System):** H1 ~2.5–4.5rem, H2 ~2–3rem, H3 ~1.5–2rem, Body ~1rem, Caption ~0.85rem.

**Typography colors:** headings use `--text-primary`; body copy uses `--text-primary` at 90% opacity for slightly softer reading color; captions/metadata use `--text-muted`; links use `--color-primary` (light) / `--color-accent` (dark) with an underline-on-hover (never color-only, for accessibility).

---

## 4. Imagery & Photography Style

- **Mood:** warm, soft directional lighting (not flat studio-white); resin pieces shot with visible light refraction/glossy highlights to emphasize the "crystal" quality.
- **Backdrops:** warm neutrals — linen, raw wood, marble, brushed beige — consistent across product and lifestyle shots so the catalog feels like one shoot even when sourced from stock (Unsplash/Pexels/Pixabay per project constraints).
- **Shot types needed per product:** hero/macro (glossy detail), in-context lifestyle (on a shelf, in a gift box, being handed over), scale reference (in-hand or with a common object).
- **Color grading:** slightly warm white balance, deep but not crushed shadows, gold/amber highlight bias — reinforces the gold-leaf brand accent even in photography.
- **People photography** (testimonials, artist story): natural light, candid rather than posed-corporate, warm skin tones consistent with the overall warm grade.
- **Treatment on hover/interaction:** subtle zoom (scale 1.0 → 1.05), never crop-shift, per the "Image Zoom" animation requirement — defined further in Phase 4.

---

## 5. Iconography

- **System:** Bootstrap Icons (per tech stack), line/outline style only — no filled icons in default state, to match the elegant/thin visual language.
- **Weight:** consistent 1.5–2px stroke equivalent; filled variant reserved for *active/selected* states only (e.g., filled heart once wishlisted, filled star for rating value).
- **Color:** icons inherit `--text-primary` by default; interactive icons (wishlist, cart, search) use `--color-accent` on hover/active.

---

## 6. Tone of Voice

| Context | Voice |
|---|---|
| Hero / marketing headlines | Confident, short, sensory — "Memories, cast in light." Not boastful, not generic ("#1 resin brand" claims avoided — trust is earned via proof, not asserted, per Phase 1). |
| Product descriptions | Precise and specific — real dimensions, real materials, real production time. Never vague ("beautiful handmade piece") without a concrete detail attached. |
| Custom Orders / personalization copy | Reassuring and procedural — sets expectations clearly (proof step, timeline, what happens if a revision is needed), because this is the highest-anxiety purchase moment identified in Phase 1. |
| Artist Story / About | Warm, first-person, specific anecdotes over generic "passion for craft" language. |
| Policies / Care Instructions | Plain, clear, no marketing language — this content's job is trust-through-clarity, not persuasion. |
| Error/empty states | Helpful and human ("Your cart's feeling light — here's what people are loving right now") rather than robotic ("No items found"). |

**House rules:** no fake urgency/scarcity language unless literally true (ties to Limited Edition collection integrity); no lorem ipsum or generic filler anywhere (per project mandate); every superlative ("premium," "luxury") must be paired with a concrete, checkable detail nearby (material, dimension, review, timeline) so claims read as earned rather than asserted.

---

**Next:** Phase 4 — Design System (spacing scale, elevation/shadow system, border-radius scale, component states, motion/easing tokens, breakpoints, glassmorphism/soft-UI component specs) — the concrete implementation layer for everything defined above.
