# Auditoria final de produccion/legal/comercial - 2026-05-25

## Alcance

Revision de configuracion productiva para NGX Transform: Firebase, Gemini, Upstash, Resend, Mercado Pago, booking/WhatsApp, legal/privacy, cron, health, CSP, telemetry, monitoreo y variables de Vercel.

No se inventaron datos legales ni comerciales. Todo dato que depende del owner o de revision legal externa queda marcado como `NECESITA_DATO_DEL_OWNER`.

## Separacion de pendientes

### Puede resolverse con codigo/config

- Cargar variables de entorno en Vercel.
- Desplegar `firestore.rules`, `storage.rules` e indices.
- Configurar `CRON_API_KEY`, health monitor y cron cleanup.
- Configurar Upstash y decidir `ALLOW_RATE_LIMIT_FALLBACK=false`.
- Configurar Resend, dominio verificado, sender y suppression.
- Configurar Mercado Pago, pricing, webhook y prueba de checkout.
- Configurar Sentry/alertas y verificar CSP reports.
- Ejecutar smoke tests contra staging/produccion.

### Requiere datos del owner o revision externa

- Responsable legal, domicilio, correo de privacidad/soporte: `NECESITA_DATO_DEL_OWNER`.
- Revision legal final de Aviso de Privacidad y Terminos por tratamiento de foto corporal/datos sensibles: `NECESITA_DATO_DEL_OWNER`.
- URL final de Calendly/booking, WhatsApp, video fundador, cupos/cohorte y pricing HYBRID: `NECESITA_DATO_DEL_OWNER`.
- Credenciales productivas Firebase/Gemini/Upstash/Resend/Mercado Pago/Vercel: `NECESITA_DATO_DEL_OWNER`.
- Politica operativa de retencion/borrado y SLA de solicitudes ARCO: `NECESITA_DATO_DEL_OWNER`.

## Matriz de produccion

| Item | Estado | Riesgo | Donde se configura | Dato requerido | Accion recomendada |
|---|---|---:|---|---|---|
| Firebase proyecto prod | Config requerida | Alto | Vercel env + Firebase console | `FIREBASE_PROJECT_ID`, client config prod | Crear proyecto prod separado o confirmar que el actual es prod. No mezclar datos de staging. |
| Firebase Admin | Config requerida | Alto | Vercel env | `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Usar service account minima para server. Guardar private key con `\n` escapados. |
| Firebase Storage bucket | Config requerida | Alto | Vercel env + Firebase Storage | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Confirmar bucket real (`*.appspot.com` o `*.firebasestorage.app`) y probar upload signed URLs. |
| Storage rules | Listo en repo, pendiente deploy | Alto | `storage.rules` | Ninguno | Desplegar reglas. Bloquean `sessions/**` y permiten `uploads/{uid}` solo al owner. |
| Firestore rules | Listo en repo, pendiente deploy | Alto | `firestore.rules` | Ninguno | Desplegar reglas. Firestore queda backend-only; Admin SDK bypass controlado por API. |
| Firestore indexes | Listo en repo, pendiente deploy | Medio | `firestore.indexes.json`, `docs/FIRESTORE_INDEXES.md` | Ninguno | Desplegar indices antes de smoke prod. |
| Auth/session cookie | Listo en codigo | Alto | `src/app/api/auth/session/route.ts`, `src/lib/authServer.ts` | Firebase Auth prod | Probar owner flow real: wizard -> loading -> results con cookie `__session`. |
| Share scope publico | Listo en codigo | Alto | `/api/sessions/[shareId]`, `/urls`, `/share-settings` | Decision UX de default | Default privado. Confirmar que owner activa scopes conscientemente antes de compartir. |
| Delete token | Parcial | Medio | `/api/sessions/[shareId]`, `src/lib/jobManager.ts` | Flujo UX/API de borrado | API exige `X-Delete-Token`; hoy no hay UI clara para recuperar/usar token. Mantener soporte manual legal o implementar owner-auth delete. |
| Consentimientos wizard | Listo en codigo | Alto | `WizardConsentPanel`, `CreateSessionSchema` | Texto legal validado | Terminos + IA son obligatorios; marketing opt-in es separado. Legal debe aprobar copy. |
| Leads/remarketing consent | Listo en API | Alto | `/api/leads`, `/api/remarketing` | Copy de consentimiento | Ambos requieren `consent: true`. Confirmar que toda UI que llama estos endpoints muestra consentimiento. |
| Aviso de Privacidad | Pendiente owner/legal | Alto | `src/app/privacy/page.tsx` | `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_LEGAL_RESPONSIBLE_NAME`, `NEXT_PUBLIC_LEGAL_RESPONSIBLE_ADDRESS` | Sustituir `NECESITA_DATO_DEL_OWNER` y pasar revision legal por datos sensibles/fotos corporales. |
| Terminos | Pendiente owner/legal | Alto | `src/app/terms/page.tsx` | Soporte legal + jurisdiccion aprobada | Confirmar disclaimers: IA no medica, no promesa de resultado, +18. |
| Retencion/cron cleanup | Config requerida | Medio | `SESSION_TTL_DAYS`, `/api/cron/cleanup` | Politica de retencion | Definir si 30 dias basta; cron borra sesiones no completadas y datos auxiliares viejos. |
| Gemini API key | Config requerida | Alto | `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_IMAGE_MODEL` | Key prod + modelo validado | Probar session real pagada. No lanzar con modelo no verificado. |
| Spend limiter Gemini | Listo en codigo, ajustar limites | Alto | `GEMINI_HOURLY_LIMIT_USD`, `GEMINI_DAILY_LIMIT_USD`, Firestore `gemini_spend` | Presupuesto owner | Definir limites prod conservadores. Falla cerrado en prod si Firestore no responde. |
| AI kill switch | Listo en codigo, config opcional | Alto | `ENABLE_AI_GENERATION`, `AI_FLAGS_FIRESTORE_PATH`, Edge Config | Operacion owner | Mantener `ENABLE_AI_GENERATION=true`; documentar runbook para apagar IA en incidente. |
| Upstash Redis | Config requerida | Alto | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Credenciales prod | Obligatorio para prod. Mantener `ALLOW_RATE_LIMIT_FALLBACK=false`. |
| Rate-limit escape hatches | Documentado | Alto | `.env.example`, `src/lib/rateLimit.ts` | Ninguno | No usar `DISABLE_RATE_LIMITS=true` ni `RATE_LIMIT_MODE=off` en prod. |
| Resend API/sender | Config requerida | Alto | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`/`EMAIL_FROM` | Dominio verificado + sender legal | No usar `@resend.dev` en prod. Configurar SPF/DKIM/DMARC. |
| Footer unsubscribe/suppression | Listo en codigo, requiere secret | Alto | `UNSUBSCRIBE_SECRET`, `/unsubscribe`, `email_suppressions` | Secret random prod | Usar secret separado de `CRON_API_KEY`. Probar baja real y suppression. |
| Email sequence cron | Config requerida | Medio | `/api/email/sequence`, `/api/email/send`, `CRON_API_KEY` | Scheduler externo/Vercel Cron | Configurar job server-to-server con `X-Api-Key`. Verificar que no envie a suppressed/converts. |
| Email preflight de sesion | Listo, transactional | Medio | `/api/sessions` | Sender Resend | Es correo transaccional de procesamiento; confirmar copy/footer con legal si se quiere incluir baja tambien. |
| Mercado Pago checkout | Config opcional/requerida si venta directa | Alto | `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, pricing env | Credenciales/prod pricing | Si no hay `MP_ACCESS_TOKEN`, checkout degrada a llamada/WhatsApp. Si se activa, webhook secret obligatorio en prod. |
| Mercado Pago public key | Reservado/no usado | Bajo | `.env.example` | Ninguno | `NEXT_PUBLIC_MP_PUBLIC_KEY` no se usa en Checkout Pro redirect actual; dejar vacio salvo futura integracion. |
| Pricing HYBRID | Pendiente owner | Alto | `NEXT_PUBLIC_HYBRID_PRICE_*`, `HYBRID_SKU_*` | `NECESITA_DATO_DEL_OWNER` | Definir al menos un precio > 0 y validar moneda `MXN`. |
| Booking/Calendly | Pendiente owner | Medio | `NEXT_PUBLIC_CALENDLY_URL`, `NEXT_PUBLIC_BOOKING_URL` | `NECESITA_DATO_DEL_OWNER` | Sin URL no se muestra CTA de Calendly. Configurar URL final antes de launch. |
| WhatsApp | Pendiente owner | Medio | `NEXT_PUBLIC_WHATSAPP_NUMBER` | `NECESITA_DATO_DEL_OWNER` | Formato internacional. Sin numero se oculta CTA de WhatsApp. |
| Video fundador | Pendiente owner | Medio | `NEXT_PUBLIC_HYBRID_VIDEO_URL`, poster/duracion | `NECESITA_DATO_DEL_OWNER` | Subir YouTube/Vimeo/embed o MP4. CSP ya permite iframes y media externos comunes. |
| Cohorte/cupos | Pendiente owner | Medio | `NEXT_PUBLIC_COHORT_LABEL`, `NEXT_PUBLIC_COHORT_SPOTS_*` | `NECESITA_DATO_DEL_OWNER` | Confirmar que scarcity sea real y actualizable. |
| CRON_API_KEY | Config requerida | Alto | Vercel env | Secret random | Requerido para health prod, cron cleanup, email sequence, counter/admin. |
| Health endpoint | Listo en codigo | Medio | `/api/health` | `CRON_API_KEY` | En prod exige `X-Api-Key`. Monitorear 200/207/503. |
| Cron cleanup | Listo en codigo, pendiente scheduler | Medio | `/api/cron/cleanup`, Vercel Cron/external | `CRON_API_KEY`, frecuencia | Ejecutar diario fuera de horas pico. |
| CSP/security headers | Mejorado | Medio | `src/proxy.ts` | Dominios finales si cambian providers | Se agrego `media-src`, Sentry ingest y dominios embed comunes. Sigue usando `unsafe-inline`; nonce/strict-dynamic queda como hardening futuro. |
| CSP reports | Mejorado | Medio | `/api/csp-report`, Sentry | `SENTRY_DSN` | Ahora captura en Sentry si DSN existe; crear alerta por volumen/anomalias. |
| Sentry | Config requerida | Medio | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN` | DSN/proyecto owner | Configurar alertas: 5xx, webhook MP, AI failures, CSP spikes, spend limiter. |
| Telemetry Firestore | Listo en codigo | Medio | `FF_TELEMETRY_ENABLED`, `telemetry_events` | Decision analytics | Habilitar en prod. Ya tiene timeout de 5s para no colgar requests. |
| Vercel env prod | Pendiente | Alto | Vercel dashboard/CLI | Todos los envs prod | Cargar vars por entorno: Preview/Staging/Production. No guardar secretos en repo. |
| Dominio canonico/OG | Config requerida | Medio | `NEXT_PUBLIC_APP_URL`, DNS/Vercel | Dominio final | Debe ser `https://transform.ngxgenesis.com` o dominio final. Validar OG `/api/og/[shareId]`. |
| N8N webhooks | Opcional | Bajo | `N8N_WEBHOOK_BASE_URL`/`N8N_WEBHOOK_URL` | URL owner | Fire-and-forget; no bloquea funnel. Configurar solo si el pipeline comercial existe. |
| QA real AI | Pendiente | Alto | Staging/prod | Foto y perfil de prueba consentido | Ejecutar upload -> analysis -> m4/m8/m12 -> result -> share settings -> email/brief. |

## Cambios aplicados en esta auditoria

- `src/app/privacy/page.tsx` y `src/app/terms/page.tsx`: fallbacks legales ahora muestran `NECESITA_DATO_DEL_OWNER` en vez de datos supuestos.
- `.env.example`: se marcaron datos de owner, se quitaron placeholders comerciales duros de Calendly/WhatsApp y se documentaron toggles locales/test-only.
- `src/proxy.ts`: CSP extendida para Sentry, video MP4 externo y embeds comunes de Calendly/YouTube/Vimeo.
- `src/app/api/csp-report/route.ts`: reportes CSP se envian a Sentry cuando hay DSN.
- `HybridOfferV2` y `HybridOfferSection`: ya no abren un Calendly hardcodeado; los CTAs se ocultan si no hay URL/WhatsApp configurados.
- `docs/FIRESTORE_INDEXES.md`: indices alineados con `firestore.indexes.json`.
- `docs/GEMINI.md`: eliminada recomendacion de modelo no verificado; ahora exige validar el modelo configurado antes de launch.

## Checklist final de lanzamiento

### Configuracion obligatoria

- [ ] Cargar envs de Firebase client/admin prod en Vercel.
- [ ] Cargar `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_IMAGE_MODEL` y validar modelo real.
- [ ] Cargar Upstash: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- [ ] Cargar secrets: `CRON_API_KEY`, `UNSUBSCRIBE_SECRET`, `AI_WORKER_TOKEN` si se usa pipeline worker.
- [ ] Cargar Resend: `RESEND_API_KEY`, `RESEND_FROM_EMAIL` con dominio verificado.
- [ ] Cargar legales: `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_LEGAL_RESPONSIBLE_NAME`, `NEXT_PUBLIC_LEGAL_RESPONSIBLE_ADDRESS`.
- [ ] Cargar comercial: Calendly/booking, WhatsApp, cohort labels, video, pricing.
- [ ] Si checkout directo esta activo: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, pricing y SKUs.
- [ ] Configurar Sentry DSNs y alertas.

### Deploy infra

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

### Validacion local antes de deploy

```bash
pnpm lint
pnpm test
pnpm build
```

### Validacion staging/production

```bash
TEST_BASE_URL=https://TU-STAGING-O-PROD.example.com \
TEST_SHARE_ID=SHARE_ID_REAL \
TEST_CRON_API_KEY="$CRON_API_KEY" \
REQUIRE_SMOKE_ENV=true \
pnpm test:smoke
```

```bash
TEST_BASE_URL=https://TU-STAGING-O-PROD.example.com \
TEST_USER_A_TOKEN="$TEST_USER_A_TOKEN" \
TEST_USER_B_TOKEN="$TEST_USER_B_TOKEN" \
TEST_USER_A_SESSION_ID="$TEST_USER_A_SESSION_ID" \
pnpm test:auth
```

```bash
curl -i -H "X-Api-Key: $CRON_API_KEY" \
  "https://TU-STAGING-O-PROD.example.com/api/health"
```

```bash
curl -i -X POST -H "x-cron-key: $CRON_API_KEY" \
  "https://TU-STAGING-O-PROD.example.com/api/cron/cleanup"
```

### Smoke manual obligatorio

1. Abrir landing y confirmar CTA hacia `/wizard`.
2. Crear sesion real con auth, foto consentida y consentimientos obligatorios.
3. Confirmar `sessions/{shareId}` con `ownerUid`, `consents`, `shareScope` privado y `status`.
4. Ejecutar analysis y generation hasta `ready` con `m4/m8/m12`.
5. Abrir `/s/{shareId}` como owner y como visitante anonimo; validar share scope.
6. Probar update de share settings y signed URLs.
7. Probar email Results/Brief y baja `/unsubscribe`; confirmar `email_suppressions`.
8. Si MP esta activo: crear preference sandbox/prod controlada y validar webhook firmado.
9. Confirmar `/api/health` con `X-Api-Key` y bloqueo sin header en prod.
10. Revisar Sentry/logs: sin 5xx, sin CSP bloqueando video/checkout, sin rate-limit/spend-limit inesperado.
