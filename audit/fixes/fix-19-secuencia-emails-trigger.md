# Fix 19 — Secuencia de emails: disparador real, guard anti-duplicados y honestidad de la UI

**Severidad:** 🟠 ALTO | **Esfuerzo estimado:** 1-3d | **Hallazgos cubiertos:** #32, #74

> Líneas verificadas en la auditoría (jun-2026); pueden desplazarse — confirma con grep antes de editar.

## Contexto (para una sesión nueva, sin conocimiento previo)
NGX Vision tiene una secuencia de nurture D0-D14 (7 templates en `src/emails/sequence/`, scheduler en `src/lib/emailScheduler.ts`, envío vía `/api/email/send` y gestión vía `/api/email/sequence`, ambos protegidos por CRON_API_KEY). Tres problemas verificados:

1. **Nada la dispara:** `vercel.json` no define `crons` (archivo completo de 8 líneas) y `.github/workflows/ci.yml` no tiene `schedule`. Si no existe un scheduler externo (n8n — no verificable desde el repo), los 7 emails de conversión **nunca se envían**.
2. **Sin guard anti-duplicados:** `/api/email/send` no comprueba si la etapa ya fue enviada — el helper `hasSentStage` existe (`emailScheduler.ts:206-208`) pero tiene **cero consumidores** (grep). Y `advanceSequence` hace read-modify-write SIN transacción (`emailScheduler.ts:112-138`): dos ejecuciones solapadas del cron envían duplicados o saltan etapas → spam y quema del dominio de envío.
3. **(#74) La UI miente sobre el email:** la pantalla de espera afirma incondicionalmente "tu enlace de acceso se ha enviado a tu correo" (`src/app/loading/[shareId]/LoadingExperience.tsx:418-420`), pero el envío es fire-and-forget y se OMITE en silencio si falta `RESEND_FROM_EMAIL`/`EMAIL_FROM` (`src/app/api/sessions/route.ts:213-216` + `src/lib/emailConfig.ts:1-2`). En la config local verificada, `RESEND_FROM_EMAIL` NO existe → el email jamás se envía mientras la UI jura que sí.

**Negocio:** o la máquina de conversión por email no corre, o corre con duplicados; y usuarios cierran la pestaña confiando en un email que nunca llega (pierden su único enlace).

## Archivos involucrados
- `vercel.json` — añadir bloque `crons`.
- `src/app/api/email/send/route.ts:~100-190` — guard `hasSentStage` antes de enviar.
- `src/lib/emailScheduler.ts:112-138, 206-208` — `advanceSequence` en transacción Firestore (`db.runTransaction`, patrón en `src/lib/spendLimiter.ts`).
- `src/app/api/sessions/route.ts:205-230` — persistir el resultado del envío (`confirmationEmailSent: boolean`) en el doc de sesión.
- `src/app/loading/[shareId]/LoadingExperience.tsx:418-420` — condicionar el copy.
- `.env.example` — nota de que `RESEND_FROM_EMAIL` es obligatoria en producción.

## Pasos
1. **vercel.json:** añadir `"crons": [{"path": "/api/cron/cleanup", "schedule": "0 8 * * *"}, {"path": "/api/email/sequence", "schedule": "*/30 * * * *"}]`. OJO: Vercel cron NO manda headers custom — verificar cómo autentican esos endpoints: `cron/cleanup` acepta `Bearer` (`src/app/api/cron/cleanup/route.ts:48-57`); para Vercel crons el patrón estándar es validar `process.env.CRON_SECRET` vía header `authorization` que Vercel inyecta. Adaptar ambos handlers para aceptar ese mecanismo ADEMÁS del existente (sin quitar el actual). Documentar en el resumen que hay que definir `CRON_SECRET` en Vercel.
2. **email/send:** antes de enviar, cargar la secuencia y `if (hasSentStage(sequence, stage)) return {skipped: "already_sent"}`. Registrar el envío en `sentEmails` en la MISMA transacción que avanza la etapa.
3. **advanceSequence:** envolver get+update en `db.runTransaction` para que dos corridas solapadas no dupliquen (la 2ª ve la etapa avanzada y no hace nada).
4. **#74:** en `sessions/route.ts`, cuando el preflight de email se omite o falla, escribir `confirmationEmailSent: false` (true si Resend respondió ok). Exponer ese campo en el GET público (es inocuo) y en `LoadingExperience.tsx` mostrar: enviado → copy actual; no enviado → "Guarda este enlace para volver a tu resultado" (sin mencionar email).
5. Tests: unit de `email/send` con etapa ya enviada → skip; transacción de advance (mock de runTransaction); assert del copy condicional (patrón de tests estáticos de copy ya existente en `src/components/results/leadMagnetCopy.test.ts`).

## Criterio de aceptación (verificable)
- `pnpm exec tsc --noEmit && pnpm lint && pnpm test` en verde.
- `python3 -c "import json;print('crons' in json.load(open('vercel.json')))"` → True.
- `grep -n "hasSentStage" src/app/api/email/send/route.ts` ≥ 1 (hoy 0 consumidores).
- `grep -n "runTransaction" src/lib/emailScheduler.ts` ≥ 1.
- Doble llamada simulada a email/send con la misma etapa → exactamente 1 envío.

## Restricciones
- NO toques nada fuera de los archivos listados (y tests nuevos junto a ellos).
- NO hagas commit ni push; deja los cambios en el working tree para revisión.
- NO actualices dependencias; NO cambies el contenido de los templates.
- Si algo inesperado bloquea el fix (p.ej. confirmación de que n8n ya dispara la secuencia), repórtalo y detente en vez de improvisar.
