# Feature Flags — Single Source of Truth

**Última actualización**: 2026-05-03
**Implementación**: [src/lib/validators.ts:180-230](../src/lib/validators.ts) (`FeatureFlagsSchema` + `getFeatureFlags()`)
**Tracked en**: AUDIT-046 del backlog

Este es el inventario maestro de feature flags. Cualquier discrepancia con `.env.example`, `CLAUDE.md`, `GEMINI.md` o `RELEASE_CHECKLIST.md` debe resolverse alineando los demás docs a este archivo y al schema en `validators.ts`.

---

## Reglas de naming + parsing

- Convención: `FF_<NOMBRE>` o `NEXT_PUBLIC_FF_<NOMBRE>` (este último expuesto al cliente)
- Parsing en [validators.ts:208-229](../src/lib/validators.ts):
  - **Default ON** (la mayoría): `process.env.FF_X !== "false"` → cualquier valor distinto de la cadena `"false"` lo activa, incluido vacío
  - **Default OFF** (solo NB_PRO): `process.env.FF_X === "true"` → debe ser explícitamente `"true"`
- Para una nueva flag: definirla SIEMPRE en `FeatureFlagsSchema` con default explícito, luego parsearla en `getFeatureFlags()`

## Tabla maestra

| Flag | Default | Owner | Estado | Notas |
|---|---|---|---|---|
| `FF_TELEMETRY_ENABLED` | true | producto | **keep** | Habilita el endpoint y los emit de eventos. No debería desactivarse en prod. |
| `FF_DELETE_TOKEN_REQUIRED` | true | seguridad | **keep** | Exige delete-token en `DELETE /api/sessions/[shareId]`. No desactivar. |
| `FF_NB_PRO` | **false** | costos | **AB candidate** | Activa Gemini 3 Pro Image (más caro) en lugar de Nano Banana 2. Solo ON cuando se valide ROI vs costo. |
| `FF_IDENTITY_CHAIN` | true | calidad AI | **keep** | Cadena m4→m8→m12 con identidad facial. Apagarla degrada el feature core. Riesgo bloqueante en backlog AUDIT-069. |
| `FF_QUALITY_GATES` | true | calidad AI | **keep** | Validación post-gen de cada imagen. Apagarla deja pasar artifacts. |
| `FF_CINEMATIC_AUTOPLAY` | true | UX | **AB candidate** | Auto-play del reveal cinematic en `/s/[shareId]`. |
| `FF_COMPARE_SLIDER` | true | UX | **keep** | Slider antes/después en results. |
| `FF_LETTER_FROM_FUTURE` | true | UX | **AB candidate** | Modal con carta del "yo del futuro" en m12. |
| `FF_OG_SPLIT_SCREEN` | true | growth | **AB candidate** | OG image con split antes/después (vs imagen única). |
| `FF_SHARE_TO_UNLOCK` | true | growth | **keep** | Gate principal de share-to-unlock. Es la lógica activa. |
| `FF_SHARE_UNLOCK` | true | — | **kill** | Duplicado/legacy de `FF_SHARE_TO_UNLOCK`. Eliminar tras 1 release sin uso. AUDIT-035. |
| `FF_REFERRAL_TRACKING` | true | growth | **keep** | Loop viral de referidos. |
| `FF_PLAN_7_DIAS` | true | producto | **AB candidate** | Plan de 7 días vs single-day variant. |
| `FF_EMAIL_SEQUENCE` | true | growth | **keep** | Habilita la secuencia D0/D1/D3/D5/D7/D10/D14. |
| `FF_DRAMATIC_REVEAL` | true | UX | **AB candidate** | Reveal cinematográfico con countdown. |
| `FF_SOCIAL_COUNTER` | true | growth | **AB candidate** | Contador "X transformaciones esta semana" como social proof. |
| `FF_AGENT_BRIDGE_CTA` | true | growth | **AB candidate** | CTA personalizada por capability vs `BookingCTA` genérica. |
| `FF_EXPOSE_ORIGINAL` | true | producto | **AB candidate** | Permite mostrar la foto original en respuestas públicas según `shareScope`. Se evalúa en runtime, no está en `getFeatureFlags()` — vive en endpoints individuales. |
| `NEXT_PUBLIC_FF_RESULTS_2` | true | producto | **AB candidate** | Toggle de la experiencia Results 2.0 (CinematicAutoplay + nuevos componentes). |

## Convenciones de cambio

- **kill**: la flag está siempre ON; eliminar el flag y la rama dead del código
- **keep**: necesaria como kill switch operativo o por compliance (no rotar a A/B)
- **AB candidate**: candidata para experimento real una vez tengamos infra de variant assignment (ver AUDIT-036)

## Cómo añadir una flag nueva

1. Añadir línea en `FeatureFlagsSchema` ([validators.ts:180-199](../src/lib/validators.ts)) con default explícito
2. Añadir línea en `getFeatureFlags()` ([validators.ts:207-230](../src/lib/validators.ts))
3. Añadir línea a `.env.example` con el default
4. Añadir fila en este archivo con owner + estado
5. (Si ON-by-default) preguntarse: ¿debería ser en realidad un kill switch en `aiKillSwitch` o config remota? Si sí, NO crear flag — usar el sistema existente

## Cómo retirar una flag

1. Confirmar con telemetría 1+ semana sin uso del path off
2. Eliminar del schema, `getFeatureFlags()`, `.env.example`, este archivo
3. Eliminar la rama dead del código (`if (flag.X)` y su `else`)
4. Commit message: `chore(flags): retire FF_X (always ON since YYYY-MM-DD)`

---

## Referencia cruzada

Otros docs que mencionan flags individuales:

- [CLAUDE.md](../CLAUDE.md) — sección "Feature Flags". **Mantener sincronizado con este archivo.**
- [docs/GEMINI.md](GEMINI.md) — describe FF que afectan la pipeline de imagen (NB_PRO, IDENTITY_CHAIN, QUALITY_GATES)
- [docs/RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) — flags marcadas como pre-prod requirement (TELEMETRY, DELETE_TOKEN)
- `.env.example` — defaults concretos para nuevos checkouts
