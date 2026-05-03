# Runbook Operacional — NGX Transform

**Última actualización**: 2026-05-02 (creado en AUDIT-013)
**Owners**: pendiente de llenar (ver sección "Equipo y owners")
**Audiencia**: on-call, ingeniería, fundador

Esta es la guía mínima viable para responder a incidentes en producción. Si encuentras un escenario nuevo, añádelo aquí.

---

## Índice rápido

- [Setup operacional](#setup-operacional) — accesos que cada on-call necesita
- [Equipo y owners](#equipo-y-owners) — quién atiende qué
- [Escenarios](#escenarios)
  1. [Gemini API quota / errores 429-5xx](#escenario-1-gemini-api-quota-exhausted-o-errores-persistentes)
  2. [Firebase down / rate limited](#escenario-2-firebase-down-o-rate-limited)
  3. [Cleanup cron falló](#escenario-3-cleanup-cron-failed)
  4. [Sentry quota exceeded](#escenario-4-sentry-quota-exceeded)
  5. [AI spend > daily limit](#escenario-5-ai-spend--daily-limit)
- [Comandos útiles](#comandos-útiles)
- [AI kill switch](#ai-kill-switch-procedimiento)

---

## Setup operacional

Cada persona en rotación on-call necesita acceso a:

| Servicio | Para qué | Cómo se obtiene |
|---|---|---|
| **Vercel** (proyecto NGX Transform) | Logs, env vars, rollback, redeploy | Invitación de owner |
| **Firebase Console** (proyecto del repo) | Firestore queries, Storage, Auth panel | Invitación a `firebase.json#default` project |
| **Sentry** (NGX Transform org) | Errores, performance, alertas | Invitación de owner |
| **Upstash Console** | Redis usage, rate-limit logs | Invitación de owner |
| **Resend Dashboard** | Email logs, deliverability | Invitación de owner |
| **Repositorio GitHub** | Hotfixes, runbook updates | Acceso write a `genesis-scann` |
| **Health endpoint** | Diagnóstico rápido | `curl -H "x-api-key: $CRON_API_KEY" https://transform.ngxgenesis.com/api/health` |

Variables de entorno locales mínimas para hacer diagnóstico desde tu laptop: `CRON_API_KEY`, `FIREBASE_*`, `UPSTASH_REDIS_REST_*`. Llena tu `.env.local` desde `.env.example`.

---

## Equipo y owners

> **TODO**: llenar con datos reales del equipo. Plantilla a continuación.

| Área | Owner principal | Backup | Horario de respuesta |
|---|---|---|---|
| Producto | _aldo_ | _—_ | best-effort |
| Infra (Vercel/Firebase) | _—_ | _—_ | _—_ |
| AI providers (Gemini, ElevenLabs) | _—_ | _—_ | _—_ |
| Email (Resend) | _—_ | _—_ | _—_ |
| Seguridad (CSP, auth) | _—_ | _—_ | _—_ |

**Canal de incidentes**: _—_ (Slack/Discord/WhatsApp por definir)
**Escalación**: si nadie responde en 30 min y el incidente afecta usuarios → notificar owner principal directamente.

---

## Escenarios

### Escenario 1 — Gemini API quota exhausted o errores persistentes

**Síntomas**:
- Wizard completa pero "Generating images" se queda en loop / falla
- Errores `429`, `5xx` o `quota exceeded` en logs Vercel para `/api/analyze`, `/api/generate-images`, `/api/generate-plan`
- Telemetría: spike en `analysis_failed`, `image_generation_failed`
- Sentry: aumento de errores con tag `provider:gemini`

**Detección**:
```bash
curl -s -H "x-api-key: $CRON_API_KEY" https://transform.ngxgenesis.com/api/health | jq '.services.gemini, .spend'
```
Si `services.gemini.status` es `degraded`/`unhealthy` o `spend.daily.remaining` es ~0 → confirmado.

**Mitigación inmediata** (≤ 5 min):
1. Activar AI kill switch (ver [sección dedicada](#ai-kill-switch-procedimiento)) — los endpoints devuelven fallback amistoso en lugar de error.
2. Si es quota de Google: verificar billing en Google Cloud Console (puede ser tarjeta declinada).
3. Si es bug nuestro (estimate del spend mal): ajustar `GEMINI_DAILY_LIMIT_USD` o `GEMINI_HOURLY_LIMIT_USD` en Vercel env y redeploy. **No subir el límite sin validar la causa raíz primero.**

**Recovery**:
1. Una vez restaurado servicio Google: desactivar kill switch.
2. Verificar con `curl` al health endpoint: `services.gemini.status === "healthy"`.
3. Probar end-to-end un wizard completo en preview deployment antes de declarar all-clear.

**Comunicación a usuarios**:
- Si > 30 min de impacto: copy en landing tipo "Estamos haciendo mantenimiento. Vuelve en X horas." (manual via Vercel rewrite o feature flag temporal).
- Email a usuarios con sesiones a medias: postergar; primero resolver.

**Postmortem** (≤ 48h del incidente):
- Documentar timeline en `docs/incidents/INC-YYYY-MM-DD-gemini-quota.md` (crear carpeta si no existe).
- Acción de seguimiento: ¿necesitamos elevar `GEMINI_DAILY_LIMIT_USD`? ¿Mejorar el estimate de cost? Crear tickets `AUDIT-XXX`.

---

### Escenario 2 — Firebase down o rate limited

**Síntomas**:
- 5xx generalizado en API endpoints
- Wizard no avanza tras subir foto
- Logs Vercel: errores `FAILED_PRECONDITION`, `UNAVAILABLE`, `DEADLINE_EXCEEDED` desde `firebase-admin`

**Detección**:
1. `curl -H "x-api-key: $CRON_API_KEY" https://transform.ngxgenesis.com/api/health | jq '.services.firebase'`
2. Status page de Google Cloud: https://status.cloud.google.com (Firestore + Storage)
3. Firebase Console > Firestore > Usage → ¿spike de reads/writes?

**Mitigación inmediata**:
- Si es **Google-side outage** (verificado en status page): nada que hacer técnico. Comunicar y esperar.
- Si es **rate limited** del lado nuestro:
  - Verificar `firestore.indexes.json` esté deployado: `firebase deploy --only firestore:indexes`
  - Activar AI kill switch para reducir carga si analyze/images son el cuello de botella.
  - Considerar elevar quotas de Firebase project (Firebase Console > Settings > Usage and billing).

**Recovery**:
- Una vez Firebase recupera: monitorear `health` por 30 min antes de declarar all-clear.
- Si hubo writes fallidos durante el incidente: revisar `gemini_spend` collection — pudo haber under-counting; ajustar manualmente si crítico.

**Comunicación**: igual que escenario 1.

---

### Escenario 3 — Cleanup cron failed

**Síntomas**:
- Firestore `sessions` collection crece sin límite (documentos > SESSION_TTL_DAYS sin status `ready` se acumulan)
- Vercel cron tab muestra `Last run: failed` para `/api/cron/cleanup`
- Costos Firestore subiendo sin razón obvia

**Detección**:
```bash
# Listar sessions abandonadas (más de 30 días, status no terminal)
# en Firestore Console > Filter:
# createdAt < 30 days ago AND status not-in ("ready")
```
- Vercel > Project > Crons → ver "Last run" y código de salida.
- Logs Vercel para `/api/cron/cleanup`.

**Mitigación inmediata**:
1. Reintentar manualmente:
   ```bash
   curl -X POST -H "x-cron-key: $CRON_API_KEY" \
     https://transform.ngxgenesis.com/api/cron/cleanup
   ```
2. Si timeout (>60s): dividir en chunks más pequeños — el endpoint usa `BATCH_SIZE=100` ([src/app/api/cron/cleanup/route.ts:29](../src/app/api/cron/cleanup/route.ts:29)). Considerar bajar a 50 temporalmente.
3. Si Firestore se queja por falta de índices: deploy `firebase deploy --only firestore:indexes`.

**Recovery**:
- Verificar `deletedCount > 0` en respuesta del retry.
- Si Firestore está MUY lleno (>10k documentos abandonados): correr cleanup repetidamente (cada hora) hasta normalizar; luego volver al horario diario normal (`0 3 * * *`).

**Postmortem**:
- ¿Por qué falló? Usualmente: timeout (>60s), índice faltante, o auth (CRON_API_KEY rotado sin actualizar Vercel).
- Considerar mover cron a Firebase Scheduler (mejor SLA) si Vercel cron tiene problemas recurrentes.

---

### Escenario 4 — Sentry quota exceeded

**Síntomas**:
- Errores en producción no aparecen en Sentry
- Email de Sentry "Your project has exceeded its quota"
- Dashboards de Sentry muestran "Rate limited" en lugar de eventos

**Mitigación inmediata** (observability degradada, app sigue funcionando):
1. **Backup observability**: usar Vercel logs directamente.
   ```bash
   # Vercel CLI
   vercel logs --since 1h --search "ERROR"
   ```
2. Verificar el `tracesSampleRate` actual en `sentry.client.config.ts` y `sentry.server.config.ts`. Si está al 100% temporalmente, bajar a 0.1.
3. Si Sentry quota se va a renovar pronto (mensual): tolerar hasta el reset.
4. Si urgente: upgrade plan de Sentry (decisión de owner).

**Recovery**:
- Verificar en Sentry dashboard que vuelven a llegar eventos.
- Crear ticket `AUDIT-XXX` para investigar **por qué** subió tanto el volumen (fugas de logging, error storm).

---

### Escenario 5 — AI spend > daily limit

**Síntomas**:
- Endpoints AI (`analyze`, `generate-images`, `genesis-voice`) devuelven `503 Service temporarily at capacity`
- `health` endpoint: `spend.daily.remaining: 0`
- Telemetría: `spend_limit_blocked` events

**Detección**:
```bash
curl -s -H "x-api-key: $CRON_API_KEY" https://transform.ngxgenesis.com/api/health | jq '.spend'
```

**Mitigación inmediata** (decidir entre A o B):

**Opción A — Bloquear correctamente (recomendado por default)**:
- El `spendLimiter` ya devolvió 503. Esto ES el comportamiento deseado para proteger costos.
- Comunicar a usuarios afectados: "Estamos a capacidad. Reintenta en 1h." (auto via copy del 503).
- Esperar reset del bucket horario (al inicio de la siguiente hora UTC) o diario (medianoche UTC).

**Opción B — Subir el límite intencionalmente** (sólo con razón fuerte):
- Verificar que **no es un bug** de cost estimate (revisar [src/lib/spendLimiter.ts](../src/lib/spendLimiter.ts) y los `recordSpend(...)` en cada endpoint).
- Verificar billing en Google Cloud para evitar sorpresas.
- En Vercel env, subir `GEMINI_DAILY_LIMIT_USD` o `GEMINI_HOURLY_LIMIT_USD`.
- Redeploy.
- **Documentar la decisión** en este runbook (sección Postmortem) — quién autorizó, monto nuevo, razón.

**Recovery**:
- Tras reset o ajuste de límite: verificar con un wizard end-to-end.
- Si la causa fue un atacante (spike anómalo de tráfico): cross-reference con rate limit logs de Upstash. Posiblemente añadir per-user caps (AUDIT-023).

---

## Comandos útiles

### Health check
```bash
# Desde laptop con .env.local cargada
source .env.local
curl -H "x-api-key: $CRON_API_KEY" https://transform.ngxgenesis.com/api/health | jq
```

### Triggear cleanup manualmente
```bash
curl -X POST -H "x-cron-key: $CRON_API_KEY" \
  https://transform.ngxgenesis.com/api/cron/cleanup
```

### Buscar una sesión específica
```bash
# Firestore (vía gcloud CLI)
gcloud firestore documents list \
  --collection-path=sessions \
  --filter="shareId=ABC123" \
  --project=$FIREBASE_PROJECT_ID
```

### Ver últimos errores Vercel
```bash
vercel logs --since 1h --search "ERROR" --project=ngx-transform
```

### Forzar redeploy sin cambios
```bash
vercel --prod
```

### Rollback a deploy anterior
```bash
vercel rollback <deployment-url>
```

---

## AI kill switch (procedimiento)

El kill switch está en [src/lib/aiKillSwitch.ts](../src/lib/aiKillSwitch.ts) y se controla por (en este orden de prioridad):

1. **Env var `ENABLE_AI_GENERATION`** (override duro, requiere redeploy)
2. **Vercel Edge Config key `ENABLE_AI_GENERATION`** (instant, sin redeploy)
3. **Firestore doc en path de `AI_FLAGS_FIRESTORE_PATH`** (instant, sin redeploy)
4. Default: enabled

### Para DESACTIVAR AI inmediatamente (recomendado: opción 3)

**Vía Firestore Console** (sin redeploy, ~1 min):
1. Firebase Console > Firestore Database
2. Navegar a `config/aiFlags/global` (path por default; verificar tu `AI_FLAGS_FIRESTORE_PATH`)
3. Editar campo `ENABLE_AI_GENERATION` → `false`
4. Save

El cache TTL es 60s ([src/lib/aiKillSwitch.ts:15](../src/lib/aiKillSwitch.ts:15)) — efecto en máximo 1 minuto.

### Para REACTIVAR AI

Misma ruta, cambiar a `true`. Verificar con `/api/health` que `spend` y respuestas de endpoints son normales.

### Verificar estado actual
```bash
curl -s https://transform.ngxgenesis.com/api/health | jq '.services'
# o leer logs de Vercel buscando "[AI KillSwitch]"
```

---

## Apéndice — convenciones de incidentes

- **Severidad**: `SEV1` (down total), `SEV2` (degradado), `SEV3` (un feature roto), `SEV4` (cosmético)
- **Postmortem**: `docs/incidents/INC-YYYY-MM-DD-slug.md` con timeline + causa raíz + acciones
- **Comunicación durante incidente**: usar canal `#incidents` (cuando exista). Frecuencia mínima: cada 30 min update mientras dure
- **All-clear**: solo después de 30 min sin nuevos síntomas + verificación end-to-end
