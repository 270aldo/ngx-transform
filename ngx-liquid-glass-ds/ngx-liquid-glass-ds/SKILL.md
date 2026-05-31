---
name: ngx-liquid-glass-ds
description: OFFICIAL NGX Liquid Glass product design system — el estilo oficial que quedó. Visual language for ALL NGX product surfaces — 3 CSS layers (tokens-brand + tokens-lg + components), 4 showcases (mobile iOS, landing, web dashboard, B2B coach portal), full font bundle (United Sans Cond + Neue Haas Grotesk), NGX logos, fitness icon tiles, diamond X-strand textures. Use whenever building ANY NGX product UI — GENESIS mobile screens, landing pages, web dashboards, coach portal views, founding-member surfaces, workout / focus moments, or any HTML / React artifact needing the canonical NGX look. Triggers — `GENESIS UI`, `pantalla GENESIS`, `landing NGX`, `coach portal`, `dashboard NGX`, `liquid glass`, `glass card`, `wallpaper navy bloom`, `KPI tile`, `nudge AI`, `range pills`, `mockup NGX`, `Founding Members landing`, `el estilo oficial NGX`. NO usar para Instagram posts (eso es `ngx-liquid-cards-hero`) ni para sólo brand voice / copy sin UI (eso es `ngx-design-system`). Esta es la capa PRODUCT.
---

# NGX · Liquid Glass · Product Design System

This is the **product** design layer for NGX. It stacks on top of the brand system (logos, fonts, palette, voice) and provides the Liquid Glass visual language used across all NGX product surfaces — the finalized "Intent 02 Medium" dosage, codified across 4 production surfaces.

The signature: **wallpaper navy + purple bloom + diamond X-strand pattern + glass cards with rim purple. United Sans Heavy ALL CAPS for data + headlines. Tabular numerals on every value. CTA pill purple with glow.**

## Before you build anything

**Read `README.md` end-to-end first.** It contains the 3-layer stack, dosage rules, copy fundamentals, the core patterns cookbook, and the 10 rules of the road. Do not skip it — the surface contract is enforced through those rules.

Then open at least one matching showcase under `showcase/` to see the system applied end-to-end (you almost never need to invent a new pattern — copy from the showcase that matches the surface you're building).

## The 3-layer stack

Every prototype imports the layers in this exact order:

```html
<link rel="stylesheet" href="tokens-brand.css"><!-- LAYER 1 · base brand tokens -->
<link rel="stylesheet" href="tokens-lg.css">   <!-- LAYER 2 · Liquid Glass materials -->
<link rel="stylesheet" href="components.css">  <!-- LAYER 3 · dashboard density (skip for non-density surfaces) -->
```

- **Layer 1** — colors, fonts, spacing, radii, shadows, easing. Token surface is closed.
- **Layer 2** — glass fills, rims, blurs, glows, wallpapers, animations, primitives (`.lg-glass`, `.lg-cta`, `.lg-headline`, `.nudge`, etc.).
- **Layer 3** — dashboard chrome and density components (`.ngx-side`, `.ngx-topbar`, `.ngx-kpi`, `.ngx-table`, `.ngx-chart`, status pills, range pills). Optional for non-dashboard surfaces.

## The 4 production showcases

These are the reference implementations. Open the one that matches the surface you're building and **copy patterns, don't reinvent**.

| # | Surface | File | Use when |
|---|---|---|---|
| 01 | Mobile App iOS | `showcase/01-mobile-app.html` | GENESIS app screens, onboarding, workout active, native mobile flows |
| 02 | Landing | `showcase/02-landing.html` | `neogen-x.com`, Founding Members landing, marketing pages, hero + pricing |
| 03 | Web App (atleta) | `showcase/03-web-app.html` | `app.neogen-x.com` — athlete dashboard, KPI grids, range controls |
| 04 | Coach Portal (B2B) | `showcase/04-coach-portal.html` | `app.neogen-x.com/coach` — max-density dense tables, heatmaps, athlete lists |

Each showcase has its own minor CSS for surface-only concerns (`mobile-app.css`, `landing.css`, `webapp.css`, `coach.css`). Reusable patterns are already lifted into `components.css`.

## Quick start cheat sheet

- **Wallpaper:** wrap the page or app canvas in `.lg-wallpaper-soft` (web/dashboard), `.lg-wallpaper-regular` (mobile / landing), or `.lg-wallpaper-bloom` (focus moments / hero). Diamond X-strand pattern is automatic.
- **Glass surfaces:** `.lg-glass` (default), `.lg-glass--purple` (active / featured / coach insight), `.lg-glass--sheet` (modals / drawers).
- **CTAs:** `.lg-cta.lg-cta--primary` (purple glow) or `.lg-cta.lg-cta--secondary` (glass translucent).
- **KPIs / metric tiles:** `.ngx-kpi` + `.ngx-kpi--feat` for the ONE featured metric per row.
- **Range pills:** `.ngx-range-pills` with `.ngx-range-pill.is-active` (7D / 30D / 1Y segmented control).
- **Status pills:** `.ngx-stat-pill--ok / --warn / --danger / --info / --purple`.
- **Coach insight / nudge:** `.nudge` (purple-tinted glass card with halo + animated dot — data → interpretation → action).
- **Tabular nums ALWAYS:** `font-variant-numeric: tabular-nums;` on every numeric span. The class `.ngx-tabular` does this. No exceptions.

## Type & voice

- **Display:** `--font-display` = United Sans Cond Heavy 900, ALL CAPS, line-height ≤1, letter-spacing −0.015em to −0.025em.
- **Body:** `--font-text` = Neue Haas Grotesk Text Pro, sentence case.
- **Labels / eyebrows:** ALL CAPS micro, 10–11px, letter-spacing 0.14–0.18em.
- **Voice formula:** *data → interpretation → action*. 3 clauses max. No emoji. Spanish neutro by default, English allowed.
- **Example:** *"HRV cerró en 52 ms. +8 vs baseline. Hoy puedes empujar."*

## The 10 visual non-negotiables

1. **Tabular nums on every number.** No exceptions.
2. **Glass needs BOTH `-webkit-backdrop-filter` AND `backdrop-filter`** (Safari ≥ 17 still requires the prefix).
3. **Diamond pattern visible behind wallpapers.** If you can't see it, the opacity is wrong.
4. **Headlines United Sans Cond Heavy 900, ALL CAPS, line-height ≤1.**
5. **Labels ALL CAPS 10–11px with wide tracking (0.14–0.18em).**
6. **One purple charge per composition.** Purple is signal, not skin — pick the CTA, the active state, OR the featured tile to wear it.
7. **Sharp corners.** `--radius-sm` 4px, `--radius-md` 8px, capsule for pills. `--radius-2xl` is forbidden except on rounded purple feature-tile icons.
8. **No flat gradient fills.** Mesh blooms behind glass YES, purple-to-pink fades NO.
9. **Voice formula:** 3 clauses max — data, interpretation, action.
10. **Emoji never.** Lucide-style 2px SVG (inline, `currentColor`), PNG feature tiles, or unicode glyphs (`→ ↑ × ✓ • …`).

## Assets — never redraw

Everything ships in the bundle. Pull as-is, don't recreate.

- **Logos** (`assets/logos/`): `logo-neogenx-on-navy.png`, `logo-white.png`, `ngx-mark-purple.png`.
- **Feature tile icons** (`assets/icons/`): `barbell`, `dumbbell`, `muscle`, `weightlifting`, `kicking`, `trainers`, `sports-mode`, `apple-fitness`, `apple-watch`. Use at 56–96px in featured contexts.
- **Brand pattern textures** (`assets/textures/`): diamond X-strand mosaics — already wired into the wallpaper classes.
- **Fonts** (`fonts/`): `UnitedSans*.otf` family (Light → Heavy, multiple widths) + `NeueHaasGroteskText-Regular/Italic/Bold.ttf`. Display Pro subhead loads from Adobe Fonts kit via `tokens-brand.css`.

## Picking the surface

When the request comes in, map it to one of the 4 showcases first.

- **Mobile app screen** (GENESIS iOS, onboarding, workout, today view, profile) → import layers 1+2 (skip `components.css` if no dashboard density). Use `ios-frame.jsx` as the device frame starter. Wrap content in `.lg-wallpaper-regular`. Tab bar = `.lg-tabbar` or `.mtab`. Workout/focus moments swap to `.lg-wallpaper-bloom`.
- **Landing page** (`neogen-x.com`, Founding Members offer, campaign page) → import layers 1+2 (components optional). Hero on `.lg-wallpaper-regular` with `.lg-headline` + `.charge` gradient on the keyword. Body sections on `.lg-wallpaper-soft`. Pricing tiers as `.opt-card` / `.lg-glass`.
- **Web app dashboard** (`app.neogen-x.com`, athlete view) → all 3 layers. Sidebar = `.ngx-side` + `.ngx-nav-item`. Topbar = `.ngx-topbar` + `.ngx-range-pills`. Data row = `.ngx-kpi` × 4 with ONE `--feat`. Charts = `.ngx-chart` with `.ngx-bar`. Wallpaper = `.lg-wallpaper-soft`.
- **B2B coach portal** (`app.neogen-x.com/coach`, dense athlete tables) → all 3 layers, **max density**. Add `.ngx-table` with `.ngx-entity-cell` rows, `.ngx-progress` recovery bars, sparkline SVG with `currentColor: var(--ngx-purple)`. Use `.ngx-heat` for compliance heatmaps.
- **Workout / focus moments** (active session, lock widget, live activity) → `.lg-wallpaper-bloom`, `.icon-btn` + `.log-btn`, `.hud-cell` for big numeric reads, `.set-tracker` for set progress dots.

## Core patterns to copy (cookbook)

These recur across all 4 surfaces. Copy them — don't reinvent.

### Hero numeric KPI
```html
<div class="ngx-kpi ngx-kpi--feat">
  <div class="ngx-kpi__head">
    <span class="ngx-kpi__l">Recovery</span>
    <span class="ngx-kpi__chip">Ready to push</span>
  </div>
  <div class="ngx-kpi__v">79<span class="u">%</span></div>
  <div class="ngx-kpi__foot">
    <span class="ngx-kpi__d up">▲ +12 vs 7d avg</span>
    <span class="ngx-kpi__base">Baseline 67%</span>
  </div>
</div>
```

### Range pills (7D / 30D / 1Y)
```html
<div class="ngx-range-pills">
  <span class="ngx-range-pill">7D</span>
  <span class="ngx-range-pill is-active">30D</span>
  <span class="ngx-range-pill">1Y</span>
</div>
```

### Coach nudge / AI insight (purple-glass, the data→interpretation→action message)
```html
<div class="nudge">
  <div class="nudge__lbl">AI Coach insight</div>
  <div class="nudge__text">HRV <b>+8 ms</b> sobre baseline. Hoy <b>Press &amp; Pull 5×5</b>.</div>
</div>
```

### CTA pair
```html
<button class="lg-cta lg-cta--primary">Start session →</button>
<button class="lg-cta lg-cta--secondary">See plan</button>
```

### Tabular number with delta
```html
<span class="ngx-num-cell">52<span class="u">ms</span><span class="d up">▲ +8</span></span>
```

## Motion

- Snappy. **120ms / 200ms / 360ms** durations only.
- Easing: `--ease-out` (`cubic-bezier(0.22, 1, 0.36, 1)`) for entrances; `--ease-in` for exits.
- **No bounces, no springs.** NGX is a stopwatch, not a mascot brand.
- Reserved long motion: `lg-pulse` (2s purple breathing on active dots), `lg-breathe` (3s avatar halo), `lg-shimmer` (1.8s on active set-tracker).

## Preview cards (Design System tab)

`preview/` contains 30+ one-card-per-token-or-component HTML snippets, organized by group (Colors, Type, Spacing, Motion, Components, Brand). The full index is in `_ds_manifest.json`. Useful when:
- Documenting the system for a new collaborator or for the team.
- Building a Design System tab inside a product or portal.
- Eyeballing one specific token in isolation (e.g. `preview/colors-glass-fills.html` to confirm the four glass fill levels).

## When extending the system

Read the **EXTENDING** section in `README.md` before adding anything. The token surface is closed unless the brand layer (`tokens-brand.css`) changes — **never invent new colors, fonts, radii, or shadow tokens.**

If you discover a pattern worth promoting from a single-surface CSS into the shared `components.css`:
1. Lift it under a `.ngx-*` namespace.
2. Add a preview card under `preview/components-*.html`.
3. Document it in `README.md` under "Core patterns".

## If invoked with no guidance

Ask 3 questions before building:
1. **Which surface?** (mobile app screen, landing section, web dashboard view, coach portal feature, workout / focus moment)
2. **What is the user doing on that surface?** (read, decide, log, configure)
3. **Which data points must be visible?** (numeric KPIs, status, time range, etc.)

Then build with the **Medium dosage** by default and the **10 rules** locked.
