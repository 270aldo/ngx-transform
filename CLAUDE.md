# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Versión:** 2.0 (PRs 0-4 implementados)
**Stack:** Next.js 16.0.7 + React 19 + TypeScript + Firebase + Tailwind CSS v4

NGX Transform is a **premium viral lead magnet** that creates realistic 12-month physical transformation projections. Users upload a photo, provide profile data, and receive AI-generated insights with visualized progress images at m0/m4/m8/m12 milestones, plus a personalized 7-day fitness plan.

## Business Context

**Strategic Purpose**: NGX Transform is a **viral lead-generation tool** designed to capture users and convert them to NGX's main subscription fitness app.

**Growth Strategy**:
- Free tool with high shareability (transformation results are inherently viral)
- Captures email leads at wizard entry
- Results page includes CTA to NGX subscription app
- Shareable URLs with Open Graph meta tags for social spread

**Differentiators**:
- Not just "before/after" - temporal projection with narrative (m0→m4→m8→m12)
- Mental + Physical analysis (stress, sleep, discipline factors)
- Cinematic "Nike commercial" aesthetic vs generic fitness apps
- Uses YOUR actual photo, not generic avatars

## User Journey

```
Landing (/)
    ↓
Wizard (/wizard)
    ├── Email capture (lead)
    ├── Photo upload (dropzone)
    ├── Identity & Biometrics (age, sex, height, weight, bodyType)
    ├── Focus Zone (upper/lower/abs/full)
    ├── Goals & Strategy (level, goal, weeklyTime)
    └── Mental Logs (stress, sleep, discipline sliders)
    ↓
Processing (BiometricLoader)
    ├── "Iniciando escaneo biométrico..."
    ├── "Analizando densidad muscular..."
    ├── "Proyectando estructura ósea..."
    └── Motivational tips rotation
    ↓
Results (/s/[shareId])
    ├── CinematicViewer (fullscreen immersive)
    ├── Timeline navigation (HOY → MES 4 → MES 8 → MES 12)
    ├── Physical/Mental toggle
    ├── NeonRadar stats visualization
    └── Share button (native share API)
    ↓
Conversion
    └── CTA to NGX subscription app
```

## Development Commands

All commands run from `app/`:

```bash
cd app
pnpm dev          # Dev server at localhost:3000
pnpm build        # Production build
pnpm start        # Production server
pnpm lint         # ESLint
```

## Architecture

**Stack**: Next.js 16.0.7 (App Router) + React 19 + Firebase + Google Gemini + Tailwind CSS v4

### Data Flow

1. **Wizard** (`/wizard`) → User uploads photo + profile data
2. **Session Creation** → Firebase Storage (photo) + Firestore (session doc)
3. **Analysis** (`/api/analyze`) → Gemini generates insights with 4-stage timeline
4. **Image Generation** (`/api/generate-images`) → Gemini Image API creates m4/m8/m12 transformations
5. **Results** (`/s/[shareId]`) → Shareable results page with timeline viewer

### Key Services

| Service | Location | Purpose |
|---------|----------|---------|
| `gemini.ts` | `src/lib/` | Gemini 2.5 Flash for profile analysis + user_visual_anchor + style_profile |
| `nanobanana.ts` | `src/lib/` | Gemini Image API with Identity Chain for consistent transformations |
| `firebaseAdmin.ts` | `src/lib/` | Server-side Firestore/Storage operations |
| `storage.ts` | `src/lib/` | Signed URL generation, buffer uploads |
| `validators.ts` | `src/lib/` | Zod schemas for all API inputs |
| `telemetry.ts` | `src/lib/` | Funnel event tracking (wizard_start → cta_completed) |
| `jobManager.ts` | `src/lib/` | Idempotent, resumable jobs for image generation |
| `imageConfig.ts` | `src/lib/` | Centralized image config (model, aspect ratio, size) |
| `promptBuilder.ts` | `src/lib/` | Robust prompt constructor with Identity Lock |
| `qualityGates.ts` | `src/lib/` | Output validation (face visible, single subject, no artifacts) |
| `viral/*` | `src/lib/viral/` | Share-to-unlock, referral tracking, social pack generator |
| `plan/*` | `src/lib/plan/` | 7-day plan generation with AI + templates |
| `schemas/*` | `src/lib/schemas/` | Strict Zod schemas for analysis output |

### API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sessions` | POST | Create session with profile + photo |
| `/api/sessions/[shareId]` | GET | Fetch session data |
| `/api/sessions/[shareId]/urls` | GET | Get signed URLs for images |
| `/api/analyze` | POST | Run Gemini analysis on session |
| `/api/generate-images` | POST | Generate m4/m8/m12 transformation images |
| `/api/email` | POST | Send results via Resend |
| `/api/leads` | POST | Capture email leads |
| `/api/unlock` | POST | Share-to-unlock flow (share_intent, request_unlock) |
| `/api/referral` | POST | Referral tracking (visit, complete, claim, stats) |
| `/api/social-pack/[shareId]` | GET | Download social pack (story, post, square) |
| `/api/plan` | POST/GET | Generate or fetch 7-day personalized plan |
| `/api/og/[shareId]` | GET | OG image (split-screen HOY vs 12 MESES) |

### Type Definitions

Core AI types in `src/types/ai.ts`:
- `InsightsResult` - Full analysis output with timeline
- `TimelineEntry` - Single milestone (m0/m4/m8/m12) with stats, prompts, mental notes
- `OverlayPoint` - Hotspot coordinates for image annotations
- `UserVisualAnchor` - Immutable description of facial/physical traits for identity preservation
- `StyleProfile` - Visual style parameters (lighting, wardrobe, background, color_grade)
- `LetterFromFuture` - m12 motivational letter content

Plan types in `src/lib/plan/planTypes.ts`:
- `SevenDayPlan` - Complete 7-day plan structure
- `DayPlan` - Single day with workout, habits, nutrition, mindset
- `Exercise` - Exercise definition with sets, reps, rest, notes

### Profile Schema (Mental Logs)

The wizard captures extended profile data beyond basic biometrics:

```typescript
// Core biometrics
age, sex, heightCm, weightKg

// Training context
level: "novato" | "intermedio" | "avanzado"
goal: "definicion" | "masa" | "mixto"
weeklyTime: 1-14 hours

// Body classification
bodyType: "ectomorph" | "mesomorph" | "endomorph"
focusZone: "upper" | "lower" | "abs" | "full"

// Mental Logs (differentiator)
stressLevel: 1-10      // Affects recovery recommendations
sleepQuality: 1-10     // Impacts training intensity suggestions
disciplineRating: 1-10 // Influences consistency expectations
```

The **Mental Logs** are fed to Gemini's "Elite Coach" prompt to personalize recommendations based on lifestyle factors, not just physical metrics.

### Key UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `CinematicViewer` | `src/components/` | Fullscreen immersive results display with Nike-style aesthetic |
| `BiometricLoader` | `src/components/` | Animated loading screen with scanning effect and tips |
| `NeonRadar` | `src/components/` | Radar chart for strength/aesthetics/endurance/mental stats |
| `RadarStats` | `src/components/` | Alternative radar visualization using recharts |
| `HolodeckViewer` | `src/components/` | Futuristic holographic display variant |
| `TimelineViewer` | `src/components/` | Timeline navigation with milestone details |
| `OverlayImage` | `src/components/` | Interactive image with clickable hotspots |

### Results 2.0 Components (v2.0)

| Component | Location | Purpose |
|-----------|----------|---------|
| `CinematicAutoplay` | `src/components/results/` | Animated reveal sequence m0→m4→m8→m12 |
| `CompareSlider` | `src/components/results/` | Touch-friendly before/after slider |
| `LetterFromFuture` | `src/components/results/` | Modal with typewriter animation for m12 letter |
| `StatsDelta` | `src/components/results/` | Animated stats progression with delta indicators |
| `ChapterView` | `src/components/results/` | Detailed milestone view with hero, narrative, stats |
| `TransformationViewer2` | `src/components/` | Orchestrator for Results 2.0 experience |
| `ShareToUnlock` | `src/components/viral/` | Share-to-unlock UI with countdown |
| `BookingCTA2` | `src/components/` | Enhanced CTA with 7-day plan generation |
| `PlanViewer` | `src/app/plan/[shareId]/` | 7-day plan viewer with day navigation and tabs |

### AI Prompt Strategy

The Gemini integration uses an **"Elite High-Performance Coach & Futurist"** persona:
- Stoic, clinical, yet motivational tone
- Generates 4-stage timeline (m0/m4/m8/m12) with:
  - `title`: Phase name (e.g., "GÉNESIS", "METAMORFOSIS")
  - `description`: Clinical summary of changes
  - `stats`: Numerical scores (0-100) for Strength, Aesthetics, Endurance, Mental
  - `image_prompt`: Detailed prompt for Nike-style transformation image
  - `mental`: Stoic mindset shift required for each stage
- Image generation uses "Nike Advertisement" / "Billboard Campaign" style prompts

### Identity Chain (v2.0)

For consistent facial identity across m4/m8/m12 transformations:

```
[IDENTITY LOCK]
Subject: {user_visual_anchor}
PRESERVE: exact facial features, skin tone, hair color/style, distinguishing marks

[TRANSFORMATION: {step} - {percent}%]
Environment:
- m4: gritty underground gym (40% progress)
- m8: lifestyle setting (70% progress)
- m12: editorial studio (100% peak form)

[NEGATIVE]
NO: CGI, cartoon, plastic skin, extra limbs, face drift, multiple subjects
```

**Reference Chaining:**
- m4 refs: [original, styleRef]
- m8 refs: [original, styleRef, m4]
- m12 refs: [original, styleRef, m8]

### Feature Flags (v2.0)

| Flag | Default | Purpose |
|------|---------|---------|
| `NEXT_PUBLIC_FF_RESULTS_2` | false | Enable Results 2.0 experience |
| `NEXT_PUBLIC_FF_OG_SPLIT_SCREEN` | true | OG split-screen (HOY vs 12 MESES) |
| `FF_SHARE_TO_UNLOCK` | true | Unlock content after sharing |
| `FF_REFERRAL_TRACKING` | true | Track referral visits/completions |
| `FF_PLAN_7_DIAS` | true | Generate 7-day plan with AI |

### Page Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/wizard` | Multi-step wizard (email, photo, profile) |
| `/s/[shareId]` | Shareable results page |
| `/plan/[shareId]` | 7-day personalized plan viewer |

## Environment Variables

Copy `app/.env.example` to `app/.env.local`:

```bash
# Required
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN..."  # Escape \n as literal
GEMINI_API_KEY=

# Optional
GEMINI_IMAGE_MODEL=gemini-2.5-pro-image-preview  # Default model
RESEND_API_KEY=                                   # For email sharing
NEXT_PUBLIC_BOOKING_URL=                          # CTA link
```

## Design System

**Colors**: Electric Violet `#6D00FF` (primary), Deep Purple `#5B21B6` (accent), Background `#0A0A0A`

**CSS Variables**: Defined in `globals.css`, exposed via `--primary`, `--accent`, `--ngx-electric-violet`

**Fonts**: Neue Haas Grotesk (body), United Sans (display) - fallback to Inter via next/font

**Components**: shadcn/ui in `src/components/ui/` and `src/components/shadcn/ui/`

## File Conventions

- Components: `PascalCase.tsx` in `src/components/`
- Lib/utils: `camelCase.ts` in `src/lib/`
- API routes: `route.ts` following Next.js App Router patterns
- Path alias: `@/*` maps to `./src/*`