# Release Checklist

> Auditoria de produccion/legal/comercial vigente: `docs/PRODUCTION_LAUNCH_AUDIT_2026-05-25.md`.

## Estado local verificado
- [x] `pnpm lint`
- [x] `pnpm test` (25 archivos, 98 tests)
- [x] `pnpm build` (39 rutas)
- [x] `/api/health` responde en local con Firebase, Redis y Gemini configurados
- [x] QA visual local de landing, wizard y resultados con capturas desktop/mobile

> Los checks marcados abajo siguen pendientes de confirmación en producción/Vercel o requieren datos legales/comerciales externos.

## Seguridad y privacidad
- [ ] Revisar matriz final de produccion/legal/comercial
- [ ] `FF_DELETE_TOKEN_REQUIRED=true` en prod
- [ ] Clientes usan `X-Delete-Token` (no query params) para borrado
- [ ] `MAX_UPLOAD_BYTES` definido (tamaño máx de foto)
- [ ] `ALLOW_RATE_LIMIT_FALLBACK` solo si es estrictamente necesario
- [ ] `shareScope` respetado en endpoints públicos
- [ ] Reglas de Storage desplegadas (solo owner en `uploads/{uid}`, bloquear `sessions/**`)
- [ ] Consentimiento requerido en leads/remarketing (UI + API)
- [ ] Consentimiento requerido y persistido en la sesión principal (`terms` + `aiProcessing`)
- [ ] `marketingEmailOptIn` separado de consentimientos necesarios
- [ ] Política de Privacidad y Términos publicados
- [ ] `NEXT_PUBLIC_SUPPORT_EMAIL` configurado para contacto legal
- [ ] `NEXT_PUBLIC_LEGAL_RESPONSIBLE_NAME` y `NEXT_PUBLIC_LEGAL_RESPONSIBLE_ADDRESS` configurados

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
- [ ] `pnpm test:auth` (si hay tokens)
- [ ] `pnpm test:smoke`
- [ ] Smoke manual de wizard y share
- [ ] Smoke manual de checkout/booking/WhatsApp segun canales activos
- [ ] Landing y CTAs alineados con auth-before-wizard (`/auth?next=/wizard`)
