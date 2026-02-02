# Release Checklist

## Seguridad y privacidad
- [ ] `FF_DELETE_TOKEN_REQUIRED=true` en prod
- [ ] Clientes usan `X-Delete-Token` (no query params) para borrado
- [ ] `MAX_UPLOAD_BYTES` definido (tamaño máx de foto)
- [ ] `ALLOW_RATE_LIMIT_FALLBACK` solo si es estrictamente necesario
- [ ] `shareScope` respetado en endpoints públicos
- [ ] Reglas de Storage desplegadas (solo owner en `uploads/{uid}`, bloquear `sessions/**`)
- [ ] Consentimiento requerido en leads/remarketing (UI + API)
- [ ] Política de Privacidad y Términos publicados
- [ ] `NEXT_PUBLIC_SUPPORT_EMAIL` configurado para contacto legal

## Costos y límites
- [ ] `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`
- [ ] `GEMINI_DAILY_LIMIT_USD` / `GEMINI_HOURLY_LIMIT_USD`
- [ ] `AI_FLAG_CACHE_TTL_MS` razonable

## Infra / Health
- [ ] `/api/health` responde 200/207/503
- [ ] `/api/health` protegido con `X-Api-Key` (`CRON_API_KEY`) en prod
- [ ] Cron cleanup activo con `CRON_API_KEY`
- [ ] Índices Firestore creados (ver `docs/FIRESTORE_INDEXES.md`)

## Emails
- [ ] `RESEND_API_KEY`
- [ ] `EMAIL_FROM` configurado
- [ ] `CRON_API_KEY` configurado para secuencias
- [ ] Links de baja (`/unsubscribe`) funcionan y se respetan en envíos

## Observabilidad
- [ ] Telemetría habilitada (`FF_TELEMETRY_ENABLED=true`)
- [ ] Alertas externas (Sentry/Logtail/Datadog) conectadas

## QA
- [ ] `npm run test:auth` (si hay tokens)
- [ ] `npm run test:smoke`
- [ ] Smoke manual de wizard y share
