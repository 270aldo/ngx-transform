# NGX Transform — GENESIS Architecture (v11.0)

GENESIS is the sole AI entity visible to the user. Internally, 13 specialized modules power 4 capabilities. Users never see module names — only "GENESIS" and its capabilities.

## v11.0 Doctrine

**GENESIS es la UNICA entidad visible al usuario.**

- No existen "agentes" desde la perspectiva del usuario
- Los 13 modulos son internos, agrupados en 4 capacidades
- Toda comunicacion es en primera persona: "Estoy analizando..." (no "BLAZE reporta...")
- El usuario interactua exclusivamente con GENESIS

## The 4 Capabilities

| Capability | Icon | Color | Internal Modules |
|------------|------|-------|------------------|
| Entrenamiento | Flame | `#fb923c` | BLAZE, ATLAS, TEMPO |
| Nutricion | Leaf | `#34d399` | SAGE, MACRO, METABOL |
| Recuperacion | Timer | `#60a5fa` | WAVE, NOVA, LUNA |
| Habitos | Sparkles | `#a78bfa` | SPARK, STELLA, LOGOS |

**GENESIS core**: `#6D00FF` (Electric Violet) — Brain icon

## Internal Modules (Not User-Facing)

Configured in `src/lib/genesis-demo/agents.ts`. These exist for orchestration logic only:

| Module | Color | Domain | Capability |
|--------|-------|--------|------------|
| BLAZE | `#FF4500` | Strength training | Entrenamiento |
| ATLAS | `#F59E0B` | Mobility & injury prevention | Entrenamiento |
| TEMPO | `#8B5CF6` | Cardio & HIIT | Entrenamiento |
| SAGE | `#10B981` | Nutrition strategy | Nutricion |
| MACRO | `#FF6347` | Macronutrient calculation | Nutricion |
| METABOL | `#14B8A6` | Metabolic analysis | Nutricion |
| WAVE | `#0EA5E9` | Recovery & HRV | Recuperacion |
| NOVA | `#D946EF` | Supplement advisory | Recuperacion |
| LUNA | `#6366F1` | Hormonal analysis | Recuperacion |
| SPARK | `#FBBF24` | Habits & mindset | Habitos |
| STELLA | `#A855F7` | Biometric analysis | Habitos |
| LOGOS | `#6D00FF` | Education & mentoring | Habitos |

## Types

From `src/types/genesis.ts`:

- `GenesisCapability`: `'entrenamiento' | 'nutricion' | 'recuperacion' | 'habitos'`
- `AgentType`: Internal module identifiers (legacy, not user-facing)

## Orchestration Phases

SSE from `/api/genesis-demo` drives the animation. The UI shows **capability progress**, not individual module names:

```
Phase 1: "Analizando tu perfil" (~6s)
    Modules: GENESIS, STELLA, LOGOS
    User sees: GENESIS analyzing

Phase 2: "Disenando tu transformacion" (~10s)
    Modules: BLAZE, TEMPO, ATLAS, SAGE, MACRO, METABOL
    User sees: Entrenamiento ████ Nutricion ████

Phase 3: "Personalizando experiencia" (~6s)
    Modules: WAVE, SPARK, NOVA, LUNA
    User sees: Recuperacion ████ Habitos ████

Total: ~22 seconds
```

Each capability transitions: `pending` (gray) -> `analyzing` (pulse) -> `complete` (check).

## UI Components

### `AgentOrchestration` (v11.0)

Located in `src/components/genesis/AgentOrchestration.tsx`:

- GENESIS central avatar with 4 capability cards
- Capability states derived from internal module progress
- Phase title and progress bar (0-100%)
- Real-time feed shows "GENESIS * Entrenamiento" (not "BLAZE reporta:")
- SSE compatibility layer maps legacy module events to capability states

### `AgentStatusBar` (v11.0)

Located in `src/components/demo/AgentStatusBar.tsx`:

- Shows "GENESIS: Optimizando entrenamiento" (not "BLAZE: analyzing")
- 3 capability indicators (Entrenamiento, Nutricion, Recuperacion)
- Compact inline variant available

### `GenesisChat` (v11.0)

Located in `src/components/demo/GenesisChat.tsx`:

- All messages attributed to GENESIS
- Agent reports display as "GENESIS * Entrenamiento" capability labels
- Legacy module keys used internally for SSE parsing only

### `D7Conversion` (v11.0)

Located in `src/emails/sequence/D7Conversion.tsx`:

- Email lists 4 capabilities, not 13 agent names
- "Entrenamiento de Precision, Estrategia Nutricional, Biohacking y Recuperacion, Arquitectura de Habitos"

### `PlanPreview`

7-day plan viewer with progressive unlock (Day 1 full, Days 2-7 locked).

### `GenesisDemo`

Main flow wrapper: AgentOrchestration -> DemoChat -> PlanPreview -> Conversion CTA

## API Endpoints

### `GET /api/genesis-demo` — SSE Orchestration

| Event | Data | Purpose |
|-------|------|---------|
| `connected` | `{ shareId, personalized }` | Initial connection |
| `phase` | `{ phase, title }` | Phase start |
| `agent` | `{ agent, status, message }` | Module status (internal) |
| `complete` | `{ message, redirect: "chat" }` | Orchestration finished |
| `error` | `{ message }` | Stream error |

### `POST /api/genesis-chat` — Chat with A2UI Widgets

5 interactions per session. SSE events: `genesis_message`, `agent_status`, `agent_report`, `plan_ready`, `done`, `error`.

### `POST /api/genesis-voice` — Voice

ElevenLabs TTS. Caches 1 hour per shareId. Falls back to text-only.

## A2UI Widget System

Located in `src/components/widgets/`:

**Base**: GlassCard, AgentBadge, ActionButton, ProgressBar
**Feature**: WorkoutCard, MealPlan, InsightCard, ChecklistWidget
**Orchestrator**: A2UIMediator

## User Journey

```
Results (/s/[shareId])
    -> CTA: "Ver como GENESIS crea tu plan"
         |
Genesis Demo (/s/[shareId]/demo)
    |-- Phase 1: AgentOrchestration (GENESIS + 4 capabilities)
    |-- Phase 2: DemoChat (5 interactions, GENESIS voice)
    +-- Phase 3: Redirect to plan
         |
Plan Preview (/s/[shareId]/plan)
    |-- Day 1: Full content (WorkoutCard + MealPlan + Checklist)
    |-- Days 2-7: Blurred + locked
    +-- ComparisonCTA ("Sin GENESIS vs Con GENESIS")
         |
Conversion
    +-- "DESBLOQUEAR MI PLAN COMPLETO"
```

## Key Source Files

| File | Location |
|------|----------|
| Module config | `src/lib/genesis-demo/agents.ts` |
| Genesis types | `src/types/genesis.ts` |
| SSE endpoint | `src/app/api/genesis-demo/route.ts` |
| Chat endpoint | `src/app/api/genesis-chat/route.ts` |
| Voice endpoint | `src/app/api/genesis-voice/route.ts` |
| AgentOrchestration | `src/components/genesis/AgentOrchestration.tsx` |
| AgentStatusBar | `src/components/demo/AgentStatusBar.tsx` |
| GenesisChat | `src/components/demo/GenesisChat.tsx` |
| DemoChat (legacy) | `src/components/genesis/DemoChat.tsx` |
| PlanPreview | `src/components/genesis/PlanPreview.tsx` |
| Orchestrator | `src/lib/genesis-orchestrator.ts` |
| A2UI widgets | `src/components/widgets/` |

## Remaining v11.0 Migration Notes

These files still contain user-facing agent name references that may need a follow-up pass:

- `src/lib/elevenlabs-voice.ts:113` — Voice text mentions BLAZE, SAGE, TEMPO
- `src/components/AgentBridgeCTA.tsx` — Shows BLAZE/NEXUS names to users
- `src/components/genesis/DemoChat.tsx` — Chat messages from individual agents
