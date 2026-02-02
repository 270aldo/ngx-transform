# NGX Transform — Plan de Implementación

**Fecha:** 2 de febrero de 2026
**Branch:** main
**Último commit:** `4a7ac2c` feat(legal): add consent flow, strengthen privacy/terms, fix themeColor

---

## Lo que se hizo en esta sesión

### Commit `84e8125` — Dead code ronda 2
- Eliminados 10 componentes orphaned (DemoClient, PlanViewer, ActionsCard, ImageViewer, InsightsCard, ProfileSummaryCard, TimelineViewer, Spinner, Stepper, A2UIMediator)
- CLAUDE.md sincronizado con auditoría (6 services, 3 pages, 1 API route, 1 feature flag agregados)
- Background color corregido en docs (#0A0A0A → #030005)

### Commit `caba3e2` — Build fix + Dead code ronda 3 + Security
- **P0:** Fix `/unsubscribe` — `useSearchParams()` envuelto en `<Suspense>` (build pasaba de FAIL a PASS)
- **P1:** 6 componentes orphaned eliminados (GenesisVoiceIntro, PlanDashboard, PlanDownload, EscapeValve, SubscriptionCTA, ShareToUnlock)
- Barrel files limpiados (demo/index.ts, results/index.ts, viral/index.ts)
- **P2:** `.gitignore` corregido (`.env*` bloqueaba `.env.example`), `.env.example` ahora tracked
- 3 feature flags agregados a `.env.example` (FF_DRAMATIC_REVEAL, FF_SOCIAL_COUNTER, FF_AGENT_BRIDGE_CTA)
- Duplicados eliminados de `.env.example`

### Commit `4a7ac2c` — Legal + themeColor
- **Consent flow:** 3 checkboxes desbundled en wizard Stage 1 (términos, procesamiento AI, emails)
- **Age min:** 13→18 en schema Zod y CyberSlider
- **Privacy:** Sección IX reemplazada con tabla de retención específica (fotos 30d, AI 12mo, email unsub+30d, bienestar 90d)
- **Terms:** Nueva sección "Imágenes generadas por IA" (disclaimer FTC) + "Ley aplicable" (México, CDMX)
- **Layout:** themeColor migrado de metadata a viewport export (elimina 12 warnings)

### Estado del build
- TypeScript: 0 errores
- Next.js build: PASS (33/33 páginas, 0 errores, 0 warnings de themeColor)
- Referencias a componentes eliminados: 0

---

## Pendientes del usuario (no son código)

Estos items requieren datos personales o configuración de servicios externos:

### 1. Llenar datos del responsable en privacy page
**Archivo:** `src/app/privacy/page.tsx` líneas 8-9
```tsx
const RESPONSABLE_NOMBRE = "[NOMBRE COMPLETO DEL RESPONSABLE]";
const RESPONSABLE_DOMICILIO = "[DOMICILIO DEL RESPONSABLE]";
```
Reemplazar con nombre legal y dirección física.

### 2. Configurar NEXT_PUBLIC_SUPPORT_EMAIL
En `.env.local` y en Vercel Environment Variables:
```
NEXT_PUBLIC_SUPPORT_EMAIL=privacy@tudominio.com
```
Este email aparece en privacy page, terms page, y es el contacto para derechos ARCO.

### 3. Configurar CRON_API_KEY en producción (Vercel)
```bash
openssl rand -hex 32
```
Agregar resultado como `CRON_API_KEY` en Vercel Environment Variables.
**Afecta:** `/api/counter`, `/api/email/send`, `/api/email/sequence`, `/api/remarketing`, `/api/cron/cleanup`

### 4. Configurar Upstash Redis en producción (Vercel)
1. Ir a https://console.upstash.com/redis
2. Crear base de datos (free tier: 10K ops/day, $0)
3. Copiar `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`
4. Agregar ambos en Vercel Environment Variables
**Afecta:** Rate limiting en todos los endpoints

### 5. Dirección postal en email templates
CAN-SPAM requiere dirección física en el footer de cada email.
**Archivos:** `src/emails/sequence/D0Results.tsx`, `D1Reminder.tsx`, `D3Plan.tsx`, `D7Conversion.tsx`
Agregar dirección postal (puede ser PO Box o dirección de negocio).

---

## Pendientes técnicos (código)

### P3 — Documentación CLAUDE.md
**Prioridad:** Baja
- 44 componentes no documentados (landing/14, demo/5, core/15+, auth/1, shadcn-ui)
- 1 service no documentado (`plan-pdf.tsx`)
- Agregar secciones: "Landing Page Components", "Demo Enhancement Components"

### P4 — Housekeeping
**Prioridad:** Baja

1. **Consolidar UI components** — `src/components/ui/` y `src/components/shadcn/ui/` tienen duplicados (button, input, etc.). Unificar en un solo directorio.

2. **Actualizar eslint-config-next** — Actualmente `@15.5.2` vs `next@16.0.7`. Ejecutar:
   ```bash
   pnpm add -D eslint-config-next@16
   ```

3. **Migrar middleware → proxy** — Next.js 16 depreca `middleware.ts` en favor de `proxy.ts`. Warning en build:
   ```
   The "middleware" file convention is deprecated. Please use "proxy" instead.
   ```
   Ref: https://nextjs.org/docs/messages/middleware-to-proxy

4. **baseline-browser-mapping** — 13 warnings de datos obsoletos. Fix:
   ```bash
   pnpm add -D baseline-browser-mapping@latest
   ```

5. **Privacy page TODO** — Línea 7: `// TODO: Reemplazar con datos reales antes de lanzamiento` — eliminar comentario una vez que el usuario llene los datos del responsable.

6. **CSP report forwarding** — `src/app/api/csp-report/route.ts:47`: actualmente logea pero no envía a monitoring. Integrar con Sentry o similar cuando haya presupuesto.

### P5 — Observabilidad (antes de escalar)
**Prioridad:** Media

1. **Error tracking** — Agregar Sentry (o similar). Sin esto, no sabes cuando algo falla en producción.

2. **Uptime monitoring** — `/api/health` existe. Necesita un servicio externo que lo ping (UptimeRobot, Better Stack, etc.).

3. **Email delivery monitoring** — Resend tiene dashboard. Configurar alertas de bounce rate > 5%.

### P6 — Tests (deuda técnica)
**Prioridad:** Media-baja
- No hay suite de tests en el proyecto
- Mínimo recomendado: tests para API routes críticas (`/api/analyze`, `/api/generate-images`, `/api/sessions`)
- Framework: Jest + React Testing Library (ya configurado en CLAUDE.md global)

---

## Auditoría de seguridad — Score actual

| Área | Score | Estado |
|------|-------|--------|
| Input Validation (Zod) | 95/100 | Excelente |
| CSP + Security Headers | 90/100 | Excelente |
| Authentication | 85/100 | Firebase ID tokens |
| Consent Flow | 80/100 | 3 checkboxes implementados |
| Authorization | 75/100 | Session ownership checks |
| Rate Limiting | **50/100** | Código listo, Redis no configurado |
| Cron Protection | **30/100** | Código listo, CRON_API_KEY no configurado |

**Para llegar a 85+:** Solo necesitas configurar items 3 y 4 del usuario (CRON_API_KEY + Upstash Redis).

---

## Contexto legal — Resumen

### Lo que ya está implementado
- Privacy policy completa (LFPDPPP) con 12 secciones
- Terms of service con disclaimer AI explícito
- Consent flow de 3 checkboxes (términos, AI, emails) antes del photo upload
- Age gate 18+ en schema y UI
- Tabla de retención de datos con plazos específicos
- Unsubscribe funcional en emails
- Ley aplicable: México, jurisdicción CDMX

### Lo que falta (del usuario)
- Datos del responsable (nombre + domicilio)
- Email de contacto para privacidad
- Dirección postal en emails (CAN-SPAM)
- Decisión: ¿Gemini paid tier o free tier? Si free tier, agregar disclosure en privacy de que Google puede usar fotos para mejorar modelos

### Riesgos legales principales (ya mitigados)
1. **BIPA (Illinois)** — Mitigado con checkbox específico de consent AI
2. **FTC Operation AI Comply** — Mitigado con disclaimer explícito en Terms
3. **CAN-SPAM** — Unsubscribe implementado, falta dirección postal
4. **LFPDPPP (México)** — Privacy policy completa, falta llenar responsable

---

## Quick start para la próxima sesión

```
1. Verificar que el usuario llenó items 1-5 de "Pendientes del usuario"
2. Si sí → commit los datos + deploy a Vercel
3. Si no → recordar y seguir con P3/P4 técnicos
4. Siguiente prioridad técnica: P4.1 (consolidar UI) o P5.1 (Sentry)
```
