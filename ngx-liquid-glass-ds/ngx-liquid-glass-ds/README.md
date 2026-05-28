# NGX Liquid Glass · Design System

> **Performance & Longevity in Glass.** The product design system for NeoGen-X (NGX) — built on top of the brand layer, extended for app, web, dashboard, and B2B surfaces in the "Liquid Glass" visual language.

This is the *product* design system. The *brand* layer (logos, fonts, palette, voice) lives in the parent [NeoGen-X Design System](neogen-x-design). This system **stacks on top**: brand tokens → LG materials → reusable components.

The signature: **wallpaper navy + purple bloom + diamond X-strand pattern + glass cards with rim purple. United Sans Heavy ALL CAPS for data + headlines. Tabular numerals on every value. CTA pill purple with glow.**

It is the **Intent 02 Medium** dosage from the original `NGX Liquid Glass.html` exploration, codified across 4 production surfaces.

---

## What's in here

```
ngx-liquid-glass-ds/
├── README.md              ← you are here
├── SKILL.md               ← agent-skill descriptor (user-invocable)
├── tokens-brand.css       ← LAYER 1 · base brand tokens
├── tokens-lg.css          ← LAYER 2 · Liquid Glass materials + primitives
├── components.css         ← LAYER 3 · dashboard/web components
├── fonts/                 ← United Sans + Neue Haas Grotesk Text Pro
├── assets/
│   ├── logos/             ← NGX wordmark, X-mark, emblem (PNG)
│   ├── icons/             ← purple-gradient fitness tile icons (PNG)
│   └── textures/          ← diamond X-strand brand patterns
├── preview/               ← Design System tab cards (per token + component)
└── showcase/              ← 4 production prototypes (Mobile / Landing / Web / Coach)
```

---

## The 3-layer stack

Every prototype imports the layers in this order, no exceptions:

```html
<link rel="stylesheet" href="tokens-brand.css"><!-- Layer 1 -->
<link rel="stylesheet" href="tokens-lg.css">   <!-- Layer 2 -->
<link rel="stylesheet" href="components.css">  <!-- Layer 3 (optional for non-dashboard surfaces) -->
```

### Layer 1 · `tokens-brand.css`
The base brand: navy / purple / gray ramps, semantic tokens (`--bg`, `--fg`, `--accent`), `--font-display` (United Sans Cond), `--font-text` (Neue Haas Grotesk Text Pro), `--font-subhead` (Display Pro via Adobe Fonts kit), spacing (`--space-1` → `--space-32`), radii, shadows, easing. Light + dark theme mappings.

### Layer 2 · `tokens-lg.css`
The Liquid Glass material system:
- **Glass fills:** `--lg-glass-thin / -regular / -thick / -purple / -sheet`
- **Rims:** `--lg-rim-thin / -regular / -strong / -purple`
- **Shadows + glows:** `--lg-glow-purple-sm/md/lg`, `--lg-shadow-glass`, `--lg-shadow-inset-purple`
- **Blurs:** `--lg-blur-thin / -regular / -thick / -sheet`
- **Wallpapers:** `.lg-wallpaper-soft / -regular / -bloom` (with diamond X-strand overlay)
- **Primitives:** `.lg-glass`, `.lg-capsule`, `.lg-cta`, `.lg-num`, `.lg-headline`, `.lg-phone`, `.lg-browser`, `.lg-ring-card`, `.lg-tabbar`, `.bio`, `.nudge`, `.session`, `.list-card`, `.opt-card`, `.lock-widget`, `.live-act`, `.coach-sheet`, `.msg`, `.next-up`, `.set-tracker`, `.icon-btn`, `.log-btn`, `.hud-cell`
- **Animations:** `lg-pulse`, `lg-shimmer`, `lg-breathe`

### Layer 3 · `components.css`
Dashboard / B2B density components born from Web App + Coach Portal:
- **Chrome:** `.ngx-browser`, `.ngx-side`, `.ngx-side-brand`, `.ngx-side-profile`, `.ngx-nav-item`, `.ngx-topbar`, `.ngx-range-pills`, `.ngx-icon-pill`, `.ngx-search-pill`, `.ngx-cta-chip`
- **Surfaces:** `.ngx-card`, `.ngx-card--purple`, `.ngx-card__head`
- **Metrics:** `.ngx-kpi`, `.ngx-kpi--feat`, `.ngx-num-cell`, `.ngx-tot`, `.ngx-totals`
- **Status:** `.ngx-stat-pill--ok / --warn / --danger / --info / --purple`, `.ngx-chip`
- **Data table:** `.ngx-table`, `.ngx-entity-cell` (avatar + name + meta), `.ngx-progress` (recovery bar)
- **Charts:** `.ngx-chart` (bar chart with optimal band), `.ngx-bar`, `.ngx-legend`, `.ngx-dist-row` (distribution bars), `.ngx-heat` (heatmap)
- **Comms:** `.ngx-bubble--them / --me`
- **Programs:** `.ngx-block--strength / --cardio / --mobility / --accessory / --dragging`

---

## CONTENT FUNDAMENTALS

Inherited from the brand system. Reading the [brand README](neogen-x-design#content-fundamentals) is mandatory before writing copy. The short form:

- **Tone:** confident, direct, second-person. Athletic + scientific blend. No emoji.
- **Headlines** → ALL CAPS, United Sans Cond Heavy, line-height ≤1.
- **Body** → sentence case, Neue Haas Grotesk Text Pro.
- **Labels / eyebrows / button text** → ALL CAPS micro (10–11px, letter-spacing 0.14–0.18em).
- **Numerals** → tabular always. `font-variant-numeric: tabular-nums;` is mandatory on every number you render.
- **Voice formula:** *data → interpretation → action*. Example: *"HRV cerró en 52 ms. +8 vs baseline. Hoy puedes empujar."*
- **Spanish or English** — the wordmark and tagline are English; product copy is Spanish neutro by default.

---

## VISUAL DOSAGE · "Intent 02 Medium"

The system has three intensities. **Default to Medium.** Going higher reads as showroom; going lower loses the LG identity.

| Dose | Glass coverage | Use case |
|---|---|---|
| **Light (30%)** | Headers + nav + CTAs only. Body remains flat navy. | High-density legacy migrations, accessibility-first views. |
| **Medium (50–60%)** ★ | Tab bar + KPI cards + nudges + sheets + sidebars. Numbers + headers + charts stay flat navy where reading must not yield. | **The default.** Mobile app, web dashboard, coach portal, settings. |
| **Full (80%+)** | Everything glass. Hero / focus moments. | Workout active, onboarding intro, splash, marketing hero. |

`tokens-lg.css` exposes a `[data-dose="light" | "full"]` attribute on the page root that swaps `.dose-glass` elements between flat and full glass — useful for tweaks panels.

---

## WALLPAPERS · the navy/purple bloom

The brand canvas. Always present behind glass surfaces.

- `.lg-wallpaper-soft` → web pages, dashboards (subtle navy, low bloom, low pattern). **Coach Portal · Web App default.**
- `.lg-wallpaper-regular` → mobile home, onboarding, landing scroll. **Mobile App default.**
- `.lg-wallpaper-bloom` → workout active, focus moments, hero campaign.

All three carry the diamond X-strand pattern as a `::before` overlay at `mix-blend-mode: screen`. Pattern opacity scales with the dose.

---

## CORE PATTERNS (cookbook)

These are the patterns that recur across the 4 surfaces. Copy them — don't reinvent.

### Hero numeric KPI
Big tabular number, small CAPS label above, delta below.
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
Segmented control. The active pill carries the purple glow.
```html
<div class="ngx-range-pills">
  <span class="ngx-range-pill">7D</span>
  <span class="ngx-range-pill is-active">30D</span>
  <span class="ngx-range-pill">1Y</span>
</div>
```

### Status pill with dot
For "Ready / Strain / Flagged / Rest" semantics.
```html
<span class="ngx-stat-pill ngx-stat-pill--ok">Ready</span>
<span class="ngx-stat-pill ngx-stat-pill--warn">Strain</span>
<span class="ngx-stat-pill ngx-stat-pill--danger">Flagged</span>
<span class="ngx-stat-pill ngx-stat-pill--info">Rest day</span>
```

### Coach nudge / AI insight (purple-glass)
The "data → interpretation → action" message. Self-contained purple-tinted glass card with halo + pulse dot.
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

### Tabular numbers everywhere
```html
<span class="ngx-num-cell">52<span class="u">ms</span><span class="d up">▲ +8</span></span>
```

---

## ICONOGRAPHY

Inherited two-tier:
- **Tier 1 · Feature tiles** (`assets/icons/`) — purple-gradient PNG tiles at 56–96px in featured / app-tile contexts.
- **Tier 2 · UI chrome** — Lucide-style 2px stroke SVG, currentColor, sharp corners. Embed inline in markup (no icon font, no separate file). Use at 14–18px in nav, buttons, table actions.

For interactive UI like the chart legends, sort arrows, sparklines: **inline SVG with `currentColor`**, no PNG fallback.

---

## MOTION

- Snappy. **120ms / 200ms / 360ms** durations.
- Easing: `--ease-out` (`cubic-bezier(0.22, 1, 0.36, 1)`) for entrances; `--ease-in` for exits.
- **No bounces, no springs.** NGX is a stopwatch, not a mascot brand.
- Reserved long motion: `lg-pulse` (2s purple breathing on active dots), `lg-breathe` (3s avatar halo), `lg-shimmer` (1.8s on active set-tracker).

---

## THE 4 SURFACES

Reference implementations live in `showcase/`. Open each to see the system applied end-to-end.

| # | Surface | URL pattern | File |
|---|---|---|---|
| 01 | Mobile App iOS | (native) | `showcase/01-mobile-app.html` |
| 02 | Landing | `neogen-x.com` | `showcase/02-landing.html` |
| 03 | Web App (athlete) | `app.neogen-x.com` | `showcase/03-web-app.html` |
| 04 | Coach Portal (B2B) | `app.neogen-x.com/coach` | `showcase/04-coach-portal.html` |

Each surface has its own minor CSS file (`mobile-app.css`, `landing.css`, `webapp.css`, `coach.css`) for things only that surface needs. The reusable patterns are already lifted into `components.css`.

---

## RULES OF THE ROAD

1. **Tabular nums always.** If you render a number, it gets `font-variant-numeric: tabular-nums;`. No exceptions.
2. **Glass needs both filter properties.** `-webkit-backdrop-filter` AND `backdrop-filter` — the `-webkit-` prefix is still required for Safari ≥ 17.
3. **Diamond pattern always visible** behind wallpapers. If you can't see it, the opacity is wrong.
4. **Headlines United Sans Cond Heavy 900, ALL CAPS, line-height ≤1, letter-spacing ≤−0.015em.**
5. **Labels micro 10–11px, letter-spacing 0.14–0.18em, ALL CAPS.**
6. **One purple charge per composition.** Purple is signal — if everything is purple, nothing is. Pick the CTA, the active state, OR the featured tile to wear it.
7. **Sharp corners** (`--radius-sm` 4px, `--radius-md` 8px, capsule for pills). `--radius-2xl` is forbidden except in the rounded purple feature-tile icon set.
8. **No gradient backgrounds.** Mesh blooms behind glass YES. Flat purple-to-pink fades NO.
9. **Voice formula:** 3 clauses max — data, interpretation, action. Drop the small-talk.
10. **Emoji never.** Lucide or PNG tiles or unicode glyphs (`→ ↑ × ✓ • …`).

---

## EXTENDING

When you discover a new pattern worth sharing across surfaces:
1. Lift it from the surface's CSS into `components.css` under a `.ngx-*` namespace.
2. Add a preview card in `preview/components-*.html` so it shows up in the Design System tab.
3. Document the pattern in this README under "Core patterns".
4. Update the SKILL.md "Quick start" if it's first-tier.

Do **not** add new colors, new fonts, or new radii. The token surface is closed unless the brand layer changes.

---

## NEXT STEPS (open questions for v2)

- Production-grade React/Vue component library — currently CSS-only.
- Light-theme surfaces — the dark-default is canonical, but landing has some light moments worth tokenizing.
- Animation library: turn `lg-pulse / lg-breathe / lg-shimmer` into a small `motion.css`.
- Figma kit mirroring `components.css`.

---

*NGX · Liquid Glass · v1 · Performance & Longevity*
