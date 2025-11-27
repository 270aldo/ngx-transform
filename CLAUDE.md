# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NGX Transform is a fitness visualization MVP that creates realistic 12-month physical transformation projections. Users upload a photo, provide profile data, and receive AI-generated insights with visualized progress images at m0/m4/m8/m12 milestones.

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

**Stack**: Next.js 15.5 (App Router) + React 19 + Firebase + Google Gemini + Tailwind CSS v4

### Data Flow

1. **Wizard** (`/wizard`) → User uploads photo + profile data
2. **Session Creation** → Firebase Storage (photo) + Firestore (session doc)
3. **Analysis** (`/api/analyze`) → Gemini generates insights with 4-stage timeline
4. **Image Generation** (`/api/generate-images`) → Gemini Image API creates m4/m8/m12 transformations
5. **Results** (`/s/[shareId]`) → Shareable results page with timeline viewer

### Key Services

| Service | Location | Purpose |
|---------|----------|---------|
| `gemini.ts` | `src/lib/` | Gemini 2.5 Flash for profile analysis, returns structured `InsightsResult` |
| `nanobanana.ts` | `src/lib/` | Gemini Image API wrapper for photo transformations |
| `firebaseAdmin.ts` | `src/lib/` | Server-side Firestore/Storage operations |
| `storage.ts` | `src/lib/` | Signed URL generation, buffer uploads |
| `validators.ts` | `src/lib/` | Zod schemas for all API inputs |

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

### Type Definitions

Core AI types in `src/types/ai.ts`:
- `InsightsResult` - Full analysis output with timeline
- `TimelineEntry` - Single milestone (m0/m4/m8/m12) with stats, prompts, mental notes
- `OverlayPoint` - Hotspot coordinates for image annotations

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