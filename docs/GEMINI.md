# NGX Transform - Gemini Context

## Project Overview
**NGX Transform** is a Next.js 16 web application designed to visualize fitness progress using AI. It takes a user's current photo and physical profile, analyzes it using **Gemini 2.5 Flash**, and generates realistic future projections (at 4, 8, and 12 months) using **Gemini 2.5 Flash Image** (internally aliased as "NanoBanana").

The application features a "Dark Premium" aesthetic (Electric Violet accents) and is built for performance and scalability using serverless functions and Firebase.

## Tech Stack
- **Framework:** Next.js 16.0.7 (App Router), React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4, shadcn/ui v4 (Radix Primitives)
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage (Google Cloud Storage)
- **AI:** 
  - **Analysis:** Google Gemini 2.5 Flash (via `@google/generative-ai`)
  - **Image Generation:** Gemini 2.5 Flash Image (via direct REST API, alias "NanoBanana")
- **Email:** Resend
- **Validation:** Zod
- **Image Processing:** Sharp (for watermarking)

## Architecture & Data Flow

### 1. User Input (Wizard)
- **Location:** `app/src/app/wizard`
- Users provide physical stats (age, weight, goal, etc.) and upload a photo.
- Photo is uploaded directly to Firebase Storage via client-side SDK.
- A session document is created in Firestore with status `processing`.

### 2. Analysis Phase
- **Endpoint:** `POST /api/analyze`
- **Logic:** `app/src/app/api/analyze/route.ts`
- Fetches the session data and signed URL for the photo.
- Calls Gemini 2.5 Flash (`app/src/lib/gemini.ts`) to analyze the physique and generate a JSON object containing:
  - **Insights:** Textual analysis of current state.
  - **Timeline:** Milestones for months 0, 4, 8, and 12, including visual prompts (`image_prompt`) for the image generator.
  - **Overlays:** Coordinate points for UI hotspots.
- Updates Firestore with the analysis results.

### 3. Image Generation Phase
- **Endpoint:** `POST /api/generate-images`
- **Logic:** `app/src/app/api/generate-images/route.ts`
- Triggered after analysis.
- Iterates through steps (m4, m8, m12).
- Calls **NanoBanana** (`app/src/lib/nanobanana.ts`) using the specific `image_prompt` generated in the previous step and the original photo as input (Image-to-Image).
- **NanoBanana** constructs a sophisticated prompt ("NIKE ADVERTISEMENT", "CINEMATIC LIGHTING") to guide the transformation based on the user's goal (definition, mass, mixed).
- Generated images are watermarked using `sharp`.
- Images are uploaded to Firebase Storage (`sessions/{sessionId}/generated/`).
- Firestore is updated with paths to the generated assets.

### 4. Results Display
- **Location:** `app/src/app/s/[shareId]`
- Public-facing page displaying the interactive transformation timeline, overlays, and insights.
- Uses `CinematicViewer`, `TimelineViewer`, and other components in `app/src/components`.

## Key Directories & Files

### Core
- `app/src/app/`: Next.js App Router pages and API routes.
- `app/src/lib/`: Utility functions.
  - `nanobanana.ts`: **CRITICAL**. Handles interaction with Gemini Image API. Defines the "Cinematic/Nike" prompt strategy.
  - `gemini.ts`: Handles text/JSON analysis with Gemini.
  - `firebaseAdmin.ts`: Server-side Firebase initialization.
  - `validators.ts`: Zod schemas (`AnalyzeSchema`, `GenerateImagesSchema`).
- `app/src/types/ai.ts`: TypeScript definitions for AI responses (TimelineEntry, InsightsResult).

### UI Components
- `app/src/components/shadcn/ui/`: Reusable primitive components.
- `app/src/components/results/`: specialized components for the results page.

## Development & Conventions

### Environment Variables (`app/.env.local`)
Required keys include:
- `GEMINI_API_KEY`: For both text and image generation.
- `FIREBASE_*`: Service account details for admin access.
- `NEXT_PUBLIC_FIREBASE_*`: Client-side Firebase config.
- `GEMINI_IMAGE_MODEL`: Defaults to `gemini-2.5-flash-image-preview`.

### Commands
All commands should be run from the `app/` directory:
- **Dev Server:** `npm run dev`
- **Build:** `npm run build`
- **Start:** `npm start`
- **Lint:** `npm run lint`

### Styling
- Uses **Tailwind v4**. Configuration is largely in CSS variables (`app/src/app/globals.css`).
- Colors:
  - Primary: Electric Violet (`#6D00FF`)
  - Accent: Deep Purple (`#5B21B6`)
  - Background: Dark (`#0A0A0A`)

### "NanoBanana" Prompt Strategy
The image generation uses a specific prompting strategy found in `app/src/lib/nanobanana.ts`:
- **Role:** "MASTERPIECE of fitness photography".
- **Style:** "NIKE ADVERTISEMENT", "CINEMATIC LIGHTING", "HIGH CONTRAST".
- **Progression:** 40% (Foundation), 70% (Transformation), 100% (Peak Form).
- **Goal-specific keywords:** e.g., "shredded" for definition, "massive muscle" for mass.
