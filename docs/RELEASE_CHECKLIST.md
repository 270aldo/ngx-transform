# Release Checklist

## Seguridad y privacidad
- [ ] `FF_DELETE_TOKEN_REQUIRED=true` en prod
- [ ] `ALLOW_RATE_LIMIT_FALLBACK` solo si es estrictamente necesario
- [ ] `shareScope` respetado en endpoints públicos
- [ ] Revisar reglas de Storage/Firestore (principio de menor privilegio)

## Costos y límites
- [ ] `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`
- [ ] `GEMINI_DAILY_LIMIT_USD` / `GEMINI_HOURLY_LIMIT_USD`
- [ ] `AI_FLAG_CACHE_TTL_MS` razonable

## Infra / Health
- [ ] `/api/health` responde 200/207/503
- [ ] Cron cleanup activo con `CRON_API_KEY`
- [ ] Índices Firestore creados (ver `docs/FIRESTORE_INDEXES.md`)

## Emails
- [ ] `RESEND_API_KEY`
- [ ] `EMAIL_FROM` configurado
- [ ] `CRON_API_KEY` configurado para secuencias

## Observabilidad
- [ ] Telemetría habilitada (`FF_TELEMETRY_ENABLED=true`)
- [ ] Alertas externas (Sentry/Logtail/Datadog) conectadas

## QA
- [ ] `npm run test:auth` (si hay tokens)
- [ ] `npm run test:smoke`
- [ ] Smoke manual de wizard y share
