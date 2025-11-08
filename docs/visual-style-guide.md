# NGX Transform Visual Style Guide

## Brand Identity Snapshot
- **Overall mood:** premium, high-contrast sci-fi fitness aesthetic anchored in deep purples over graphite backgrounds.
- **Layout language:** generous spacing, rounded corners (12–16 px) and subtle glassmorphism via translucent panels and radial glows.
- **Iconography:** Lucide icon set, used with 20–24 px stroke weight alongside outlined buttons.

## Color System
The design tokens live in `src/app/globals.css` and map directly to CSS custom properties and Tailwind CSS v4 design tokens.

| Token | Hex | Intended usage |
| --- | --- | --- |
| `--background` | `#0A0A0A` | Global page background.
| `--foreground` | `#E6E6E6` | Primary body copy.
| `--card` | `#0D0D10` | Surfaces for cards, dialogs and popovers.
| `--primary` | `#6D00FF` (Electric Violet) | Brand CTAs, focus ring, highlight gradients.
| `--secondary` | `#111116` | Secondary buttons and neutral chips.
| `--accent` | `#5B21B6` (Deep Purple) | Complementary accents, gradient tails.
| `--muted` | `#111113` | Backgrounds for muted elements, skeletons.
| `--muted-foreground` | `#A1A1AA` | Secondary text.
| `--destructive` | `#EF4444` | Error states and destructive actions.
| `--border` | `#1F2937` | Card outlines and separators.
| `--ring` | `#6D00FF` | Focus state around inputs and controls.

**Gradients & Lighting**
- `.text-gradient` combines Electric Violet to Deep Purple for hero headings and KPIs.【F:src/app/globals.css†L79-L84】
- `.section-hero::before` adds dual radial glows (rgba Electric Violet and Deep Purple) for atmospheric background lighting.【F:src/app/globals.css†L86-L101】
- `.card` applies a vertical translucent gradient and inset highlight to simulate frosted glass.【F:src/app/globals.css†L103-L108】

## Typography
Fonts are configured in `globals.css` and bound to CSS variables that Next.js populates via the Inter font loader in `layout.tsx`.

| Role | Stack | Usage |
| --- | --- | --- |
| Display | `United Sans`, fallback to sans stack | Hero headings (`h1–h3`) and key metrics.【F:src/app/globals.css†L47-L69】【F:src/app/layout.tsx†L1-L35】
| Sans (body) | `Neue Haas Grotesk Text Pro`, fallback to Inter/system sans | Body copy, forms, UI labels.【F:src/app/globals.css†L35-L76】
| Mono | `ui-monospace`, system fallback | Code snippets/diagnostics (rare).【F:src/app/globals.css†L64-L76】

**Weights & Styling**
- Medium (500–600) weights highlight navigation links and card headings.
- Bold (700) United Sans drives hero typography and CTA emphasis.
- `font-ngx-display` and `font-ngx-sans` classes come from the `variable` props in `layout.tsx`, ensuring both fonts participate in Tailwind’s `font-display` utilities.

## Spacing & Radii
- Global border radius token `--radius: 12px`; cards explicitly round to 16 px for a softer silhouette.【F:src/app/globals.css†L29-L33】【F:src/app/globals.css†L103-L108】
- Layout containers (wizard/results) rely on Tailwind utilities like `max-w-6xl` and `px-4` to maintain comfortable horizontal padding.

## Motion & Micro-interactions
- `@keyframes fadeInUp` powers `.anim-fade-in-up` utilities for subtle entrance animations (~280–420 ms ease-out).【F:src/app/globals.css†L110-L115】
- Toasts, skeletons and steppers use opacity/scale transitions baked into their respective components to keep feedback responsive without harsh motion.

## Component Patterns
- **Cards:** Use `.card` helper plus Tailwind utilities for padding (`p-6`) and layout; typically pair with `shadow-[custom]` for depth.
- **Buttons:** Derived from the shadcn button primitive; primary buttons adopt `bg-primary text-primary-foreground`, while secondary actions use `bg-secondary/80` with border emphasis.
- **Stepper & Skeletons:** Restored components (`src/components/Stepper.tsx`, `src/components/ui/skeleton.tsx`) adhere to the muted palette for inactive states.
- **Minimap:** Employs the accent gradient to preview generated imagery while keeping background consistent with `--card`.

## Imagery & Media
- Remote imagery whitelists Firebase Storage hosts (see `next.config.ts`) and generally displays within rounded cards to match the base aesthetic.【F:next.config.ts†L1-L15】
- Loading placeholders leverage the muted palette with animated gradients for shimmer effects.

## Practical Usage Checklist
1. Apply semantic color tokens via Tailwind class names (`bg-background`, `text-muted-foreground`, etc.) to maintain consistency.
2. Use `font-ngx-display` for display headings and `font-ngx-sans` for paragraph text.
3. When introducing new surfaces, start from `.card` or the `card` Tailwind preset and adjust opacity/blur to stay on-brand.
4. Reserve Electric Violet for key CTAs or focus; accent purple should support but never overpower primary elements.
5. Animate entrances with `.anim-fade-in-up` variants for continuity with existing flows.

