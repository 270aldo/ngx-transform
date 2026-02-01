# NGX Transform — AI Pipeline

Full documentation of the AI pipeline powering NGX Transform: analysis, image generation, quality validation, and plan generation.

## Overview

```
Photo + Profile
    ↓
gemini.ts (Gemini 2.5 Flash)
    ├── InsightsResult (timeline, stats, mental notes)
    ├── user_visual_anchor (facial identity description)
    └── style_profile (lighting, wardrobe, background, color_grade)
    ↓
promptBuilder.ts
    └── Identity Lock prompt per milestone (m4/m8/m12)
    ↓
nanobanana.ts (Gemini Image API)
    ├── Reference Chaining (original → styleRef → previous step)
    └── Generated images with quality scores
    ↓
qualityGates.ts
    ├── Face visible? Single subject? No artifacts?
    └── QualityCheckResult (score, issues, canRetry)
    ↓
plan/ (Gemini 2.0 Flash Lite)
    └── SevenDayPlan (workout, nutrition, habits, mindset × 7 days)
```

## 1. Profile Analysis — `gemini.ts`

**Model:** Gemini 2.5 Flash (configurable via `GEMINI_MODEL`)

**Exported functions:**

| Function | Purpose |
|----------|---------|
| `generateInsightsV2(params)` | Main analysis — returns full `AnalysisOutput` (v2.0 schema) |
| `generateInsightsFromImage(params)` | Legacy analysis entry point |
| `extractVisualAnchor(analysis, fallback?)` | Extracts `user_visual_anchor` string from analysis |
| `extractStyleProfile(analysis)` | Extracts `style_profile` object |
| `extractLetterFromFuture(analysis)` | Extracts optional m12 motivational letter |

**Analysis output (v2.0 schema):**

- `user_visual_anchor` — Forensic-level facial description (100-400 words) for identity preservation across milestones. Covers bone structure, nose/lip/eye shape, skin tone, hair details, distinguishing marks.
- `style_profile` — Object with `lighting`, `wardrobe`, `background`, `color_grade` fields describing the visual style for image generation.
- `timeline` — Object with m0/m4/m8/m12 phases, each containing:
  - `title`: Phase name (e.g., "GENESIS", "METAMORFOSIS")
  - `description`: Clinical summary of changes
  - `stats`: Scores (0-100) for Strength, Aesthetics, Endurance, Mental
  - `image_prompt`: English prompt for image generation
  - `mental`: Stoic mindset shift note (Spanish)
  - `risks` / `expectations` (m0 only)
- `letter_from_future` — Optional m12 motivational letter

**Persona:** "Elite High-Performance Coach & Futurist" — stoic, clinical, motivational tone.

## 2. Prompt Construction — `promptBuilder.ts`

**Exported functions:**

| Function | Purpose |
|----------|---------|
| `buildImagePrompt(context)` | Builds complete image generation prompt with Identity Lock |
| `buildCorrectivePrompt(context, failureReason)` | Retry prompt after quality gate failure |
| `getVisualAnchorSystemPrompt()` | System prompt for generating `user_visual_anchor` |
| `getStyleProfileSystemPrompt()` | System prompt for generating `style_profile` |

**Identity Lock mechanism:**

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

**Reference chaining per milestone:**
- m4: `[original, styleRef]`
- m8: `[original, styleRef, m4]`
- m12: `[original, styleRef, m8]`

## 3. Image Generation — `nanobanana.ts`

**Model support:**
- `gemini-3-pro-image-preview` — Identity Chain enabled (when `FF_NB_PRO=true`)
- `gemini-2.5-flash-image-preview` — Legacy mode
- Configurable via `GEMINI_IMAGE_MODEL` env var

**Exported functions:**

| Function | Purpose |
|----------|---------|
| `generateTransformedImage(params)` | Main generation with Identity Chain + quality scoring |
| `generateTransformedImageLegacy(params)` | Legacy generation (buffer + contentType only) |

**Generation result:**

```typescript
{
  buffer: Buffer              // Generated image data
  contentType: string         // MIME type
  qualityScore: number        // 0-100
  degraded: boolean           // Failed gates but continues
  model: string               // Which model was used
  usedIdentityChain: boolean  // Whether references were loaded
}
```

**Generation steps (NanoStep):**

| Step | Progress | Environment |
|------|----------|-------------|
| m4 | 40% | Underground gym |
| m8 | 70% | Lifestyle setting |
| m12 | 100% | Editorial studio (MID-WORKOUT intensity) |

**Prompt strategy:** "NIKE ADVERTISEMENT", "CINEMATIC LIGHTING", "HIGH CONTRAST" with goal-specific keywords (e.g., "shredded" for definition, "massive muscle" for mass).

## 4. Quality Validation — `qualityGates.ts`

**Exported functions:**

| Function | Purpose |
|----------|---------|
| `isQualityGatesEnabled()` | Checks `FF_QUALITY_GATES` flag |
| `validateImageBasics(buffer, contentType)` | Validates buffer, size, MIME type |
| `checkApiResponse(response)` | Checks for safety blocks, missing data |
| `runQualityGates(buffer, contentType, apiResponse?)` | Full validation pipeline |
| `getCorrectionMessage(issues)` | Human-readable correction for retry |
| `formatQualityReport(result)` | Formatted quality report string |

**Quality checks:**

1. Image data exists and has content
2. File size between 10KB and 20MB
3. MIME type is `image/jpeg`, `image/png`, or `image/webp`
4. API response not blocked by SAFETY or RECITATION
5. Inline image data present in response

**Issue types:**

```
no_image_data | image_too_small | blocked_by_safety |
generation_failed | api_error | unknown_format |
face_not_visible | multiple_subjects | severe_artifacts |
identity_drift | low_resolution | wrong_aspect_ratio
```

**Result:**

```typescript
{
  passed: boolean     // true if score >= 50 and no errors
  score: number       // 0-100
  issues: QualityIssue[]
  canRetry: boolean   // true if retry might help
  degraded: boolean   // true if passed despite issues
}
```

## 5. Plan Generation — `plan/`

**Files:**

| File | Purpose |
|------|---------|
| `planTypes.ts` | Type definitions: `SevenDayPlan`, `DayPlan`, `Exercise`, `ProfileSummary` |
| `planGenerator.ts` | AI-first plan generation with template fallback |
| `planTemplates.ts` | Exercise templates by zone, nutrition by goal, habits, mindset notes |
| `index.ts` | Re-exports all above |

**Model:** Gemini 2.0 Flash Lite (fallback: Gemini 2.5 Flash, configurable via `PLAN_GENERATION_MODEL`)

**Generation strategy:**

1. AI-first: Gemini generates 7 days with workout, habits, nutrition, mindset
2. Validation: Zod schema checks structure
3. Fallback: Template-based generation if API fails or no API key

**Plan structure:**

```typescript
SevenDayPlan {
  sessionId: string
  profile: ProfileSummary
  days: DayPlan[] // 7 days
  generatedAt: Date
  insightsUsed?: string
}

DayPlan {
  day: 1-7
  workout: { focus, exercises[], duration, intensity }
  habits: { morning[], evening[] }
  nutrition: { calories, protein, meals[] }
  mindset: string // Stoic daily note
}
```

**Template data (fallback):**
- `EXERCISES_BY_ZONE`: upper, lower, abs, full
- `NUTRITION_BY_GOAL`: definicion (26 cal/kg deficit), masa (35 cal/kg surplus), mixto (30 cal/kg maintenance)
- `MINDSET_NOTES`: 7 stoic daily reminders
- `INTENSITY_BY_LEVEL`: novato→low, intermedio→medium, avanzado→high

## 6. Feature Flags

| Flag | Default | Controls |
|------|---------|----------|
| `FF_IDENTITY_CHAIN` | true | Identity chain for consistent faces across milestones |
| `FF_QUALITY_GATES` | true | Output validation gates |
| `FF_NB_PRO` | false | Nano Banana Pro (Gemini 3 Pro Image model) |
| `FF_CINEMATIC_AUTOPLAY` | true | Animated reveal m0 through m12 |
| `FF_COMPARE_SLIDER` | true | Before/after comparison slider |
| `FF_LETTER_FROM_FUTURE` | true | m12 motivational letter modal |
| `FF_PLAN_7_DIAS` | true | 7-day plan generation with AI |

## Key Source Files

| File | Location | Lines |
|------|----------|-------|
| `gemini.ts` | `src/lib/` | Profile analysis + visual anchor extraction |
| `promptBuilder.ts` | `src/lib/` | Identity Lock prompt construction |
| `nanobanana.ts` | `src/lib/` | Image generation with reference chaining |
| `qualityGates.ts` | `src/lib/` | Output validation pipeline |
| `planGenerator.ts` | `src/lib/plan/` | AI + template plan generation |
| `planTemplates.ts` | `src/lib/plan/` | Exercise/nutrition/habit templates |
| `planTypes.ts` | `src/lib/plan/` | TypeScript type definitions |
