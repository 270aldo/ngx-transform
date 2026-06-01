# Launch Operations — NGX Transform

> Documento de continuidad para no perder la estrategia de launch, operacion y automatizaciones del proyecto. No guardar aqui secretos, tokens, API keys ni datos reales de usuarios.

## Contexto

NGX Transform es un lead magnet premium para mercado mexicano, latino y espanol. La experiencia principal captura email, foto y perfil; genera una visualizacion aspiracional de transformacion; y conduce al usuario hacia GENESIS / NGX HYBRID mediante resultados, diagnostico, voice agent, WhatsApp, booking o checkout.

La prioridad de launch no es agregar mas features. La prioridad es cerrar seguridad, privacidad, staging real, medicion y operacion diaria.

## Estado Actual

Ya existe una base tecnica fuerte:

- Hardening P1/P2 aplicado a rutas owner-only.
- `requireSessionOwner` server-side.
- Proteccion owner-only para realtime, classify, hybrid-offer, feedback, brief, checkout y delete.
- `/api/telemetry` publica marcada como `trusted:false`.
- `AI_WORKER_TOKEN` separado de `CRON_API_KEY`.
- Reserva atomica de spend.
- Tests locales para MercadoPago mockeado.
- Tests locales para telemetry publica untrusted.
- Runbook P1/P2 en `docs/qa/P1_P2_RELEASE_READINESS_RUNBOOK.md`.
- Checklist de release en `docs/RELEASE_CHECKLIST.md`.

Validacion local reciente:

- `pnpm exec tsc --noEmit` paso.
- `pnpm lint` paso.
- `pnpm test` paso.
- `pnpm build` paso.
- Visual QA local con Playwright paso en `390x844`, `768x1024`, `1440x900` para demo/loading/results/hybrid-offer.
- No se reprodujo hydration mismatch por `caret-color` en la prueba local.
- Si se observaron logs de telemetry timeout de 5s en dev; las requests siguieron respondiendo `200`.

## Lo Que Falta Antes De Launch

Falta cerrar el release gate real:

- Crear fixtures reales en Firebase staging.
- Ejecutar `test:auth` y `test:smoke` contra staging con tokens reales.
- Probar owner vs non-owner vs anonymous.
- Probar delete owner-only en dashboard con fixture desechable.
- Probar delete token legacy con fixture desechable.
- Confirmar que telemetry publica no muta funnel canonico, CRM, N8N ni lead scoring.
- Visual QA staging en mobile/tablet/desktop.
- Revisar frecuencia real de telemetry timeouts.
- Preparar dominio, hosting, observabilidad y soft launch.

## Dominio

Decision tomada: comprar y administrar el dominio dentro de Vercel Domains. Todo el ecosistema (deploy, DNS, previews, redirects, observability y certificados SSL) vive en una sola plataforma. No se usan registrars externos (GoDaddy, Namecheap, etc.) ni DNS de terceros.

Pendiente decidir (solo detalle, no plataforma):

- Nombre final del dominio.
- Si se compraran dominios defensivos o variantes.
- Estructura de subdominios: production, staging, previews y posibles landings futuras.
- Politica de redirects: dominio raiz, `www`, links cortos y rutas legacy.

Recomendacion operativa:

- Comprar un dominio principal corto, facil de decir y escribir.
- Evitar guiones y nombres dificiles de pronunciar.
- Activar renovacion automatica.
- Mantener DNS y certificados en Vercel; no mover a proveedores externos.
- No mezclar secrets ni datos sensibles en notas de dominio.
- Documentar dominio principal, dominios defensivos y subdominios activos.

## Hosting: Vercel

Decision tomada: Vercel para todo (hosting, dominio, DNS, previews y observabilidad). Netlify queda descartado.

Razon:

- El proyecto usa Next.js 16, App Router, route handlers, dynamic pages, proxy/middleware, OG images, auth cookies y muchas APIs internas.
- Vercel es el camino con menos friccion para Next.js.
- Tiene previews, env vars por entorno, analytics, speed insights y observability integrados.
- Una sola plataforma reduce superficie operativa y evita configuracion cruzada de DNS/SSL.

Nota tecnica de plataforma:

- El rate-limiting depende de `x-vercel-forwarded-for` para identificar IP del cliente. En Vercel esto funciona out-of-the-box; no hace falta `TRUST_PROXY_IP_HEADERS`.

Decision pendiente (solo setup, no plataforma):

- Crear proyecto staging y production.
- Configurar env vars separadas por entorno.
- Confirmar dominios y redirects.
- Confirmar logs, alerts y health checks.

## Herramientas Recomendadas

Minimo profesional para launch:

- Hosting: Vercel.
- Dominio: Vercel Domains.
- Auth/DB/Storage: Firebase.
- Web analytics: Vercel Analytics o Google Analytics.
- Performance real: Vercel Speed Insights.
- Errores: Sentry.
- Logs/observabilidad: Vercel Observability; luego Better Stack/Logtail si hace falta.
- Email: Resend dashboard.
- Payments: MercadoPago dashboard.
- Funnel interno: Firestore telemetry + reportes diarios.
- Automatizaciones: Codex App.

Herramientas opcionales despues del soft launch:

- Looker Studio o Google Sheets para reporting comercial.
- PostHog si se quiere product analytics mas avanzado.
- n8n para automatizar CRM, scoring y seguimiento.
- Hotjar/Clarity solo si se revisa privacidad y consentimiento.

## Que Debe Vigilar Un Dev Despues Del Launch

Salud tecnica:

- Landing responde.
- Wizard responde.
- `/api/health` responde `200`, `207` o estado esperado.
- No hay picos de `5xx`.
- No hay errores de Firebase auth/firestore/storage.
- No hay errores de firmas o URLs de imagen.
- No hay CSP reports criticos.
- No hay rate limits inesperados para usuarios legitimos.

Privacidad y seguridad:

- Anonymous recibe `401` donde corresponde.
- Non-owner recibe `403` donde corresponde.
- Public session response no expone PII.
- `/api/telemetry` sigue siendo append-only untrusted.
- Share scope se respeta.
- Delete solo borra datos del owner o fixture con token valido.
- No hay intentos anormales de abuso o scraping.

Funnel:

- Visitas landing.
- Clicks al wizard.
- Sesiones creadas.
- Wizard completado.
- Results viewed.
- Usuarios que llegan a HYBRID offer.
- Clicks a WhatsApp, booking, video, voice agent o checkout.
- Conversiones reales.
- Drop-off principal del funnel.

IA y costos:

- Analisis iniciados/completados/fallidos.
- Image generation iniciada/completada/fallida.
- Spend limiter por hora/dia.
- AI kill switch disponible.
- Timeouts o retries.
- Costo estimado por lead.

Comercial:

- Leads nuevos.
- Leads de alta intencion.
- NPS/feedback.
- Respuestas en WhatsApp/booking.
- Checkout preference creada.
- Webhook aprobado.
- Conversion marcada.
- Errores o mismatches de MercadoPago.

## Automatizaciones Codex Recomendadas

Las automatizaciones deben producir reportes accionables, no ruido. Cada reporte debe separar:

- Bloqueadores.
- Riesgos.
- Observaciones.
- Acciones recomendadas.

### 1. Daily Health Report

Frecuencia: diario, temprano.

Revisa:

- `/api/health`.
- Landing, wizard, results demo/staging.
- Estado de Firebase, Redis, Gemini si el health lo expone.
- Errores recientes.
- Build/deploy status si esta disponible.

Salida esperada:

- Estado general: OK / WARN / CRITICAL.
- Rutas caidas.
- Servicios degradados.
- Acciones recomendadas.

### 2. Daily Funnel Report

Frecuencia: diario.

Revisa:

- Landing visits.
- Wizard starts.
- Sessions created.
- Results viewed.
- HYBRID offer viewed.
- Voice agent opened/classified.
- WhatsApp/booking/checkout clicks.
- Conversiones.

Salida esperada:

- Conversion por etapa.
- Mayor drop-off.
- Comparacion contra dia anterior.
- Accion recomendada de producto o copy.

### 3. Daily Security And Privacy Report

Frecuencia: diario, y adicional si hay launch publico fuerte.

Revisa:

- `authFailed`.
- `rateLimitBlocked`.
- CSP reports.
- Intentos non-owner.
- Requests publicas sospechosas.
- Telemetry publica con `trusted:false`.
- Share scope.

Salida esperada:

- Riesgos criticos.
- Cualquier posible exposicion de PII.
- IPs o patrones sospechosos.
- Recomendacion: observar, bloquear, parchear o pausar.

### 4. Daily AI Spend Report

Frecuencia: diario.

Revisa:

- Gasto estimado del dia.
- Gasto estimado de la hora.
- Bloqueos por spend limiter.
- Fallos de Gemini/OpenAI.
- Retries.
- Ratio costo por lead.

Salida esperada:

- Estado de presupuesto.
- Riesgo de gasto anomalo.
- Si conviene bajar limites, apagar AI o investigar.

### 5. Checkout And Webhook Monitor

Frecuencia: diario; durante launch, cada pocas horas.

Revisa:

- Preferences creadas.
- Webhooks recibidos.
- Pagos aprobados, pending, failed.
- Mismatch de SKU, monto o moneda.
- Sesiones convertidas.

Salida esperada:

- Conversiones reales.
- Webhooks invalidos.
- Pagos que requieren reconciliacion.
- Alertas de integracion MercadoPago.

### 6. Visual Smoke Monitor

Frecuencia: diario o despues de deploy.

Viewports:

- `390x844`.
- `768x1024`.
- `1440x900`.

Paginas:

- `/`.
- `/wizard`.
- `/loading/[shareId]`.
- `/s/[shareId]`.
- `/s/[shareId]#hybrid-offer`.
- `/dashboard`.
- `/dashboard/[shareId]`.

Salida esperada:

- Screenshots.
- Overflow horizontal.
- Errores JS.
- Hydration mismatch.
- CTAs no visibles.
- Elementos solapados.

### 7. Launch Backlog Triage

Frecuencia: diario durante launch.

Entrada:

- Health report.
- Funnel report.
- Security report.
- AI spend report.
- Checkout report.
- Visual report.

Salida esperada:

- Lista priorizada:
  - Launch blocker.
  - Arreglar hoy.
  - Arreglar esta semana.
  - Mejora futura.

## Soft Launch Recomendado

No lanzar directo con trafico grande.

Orden recomendado:

1. Staging real.
2. Go/No-Go tecnico.
3. Produccion preparada.
4. Soft launch cerrado con 10-30 personas.
5. Ajustes.
6. Soft launch ampliado con 100 usuarios.
7. Launch publico.
8. Ads/influencers/partnerships.

Durante soft launch medir:

- Cuantos completan wizard.
- Si entienden privacidad.
- Si los resultados sorprenden.
- Si el CTA hacia HYBRID se entiende.
- Si WhatsApp/booking/checkout funcionan.
- Donde se confunden.
- Que objeciones aparecen.

## Go/No-Go De Launch

GO si:

- Staging real pasa owner/non-owner/anonymous.
- Delete funciona solo con owner o token legacy valido.
- Telemetry publica no muta funnel/CRM/N8N/lead scoring.
- Visual QA pasa en mobile/tablet/desktop.
- Produccion tiene env vars legales y operativas.
- Rate limits y spend limits estan activos.
- Health endpoint y monitoreo estan listos.
- Hay plan para responder incidentes.

NO-GO si:

- Un non-owner puede mutar una sesion.
- Anonymous puede acceder a datos privados.
- Invalid webhook puede convertir una sesion.
- Telemetry publica puede modificar funnel canonico.
- Delete puede borrar datos de otro usuario.
- Mobile bloquea wizard, results, privacy controls o CTA.
- No hay forma de observar errores/costos despues de launch.
- Faltan datos legales obligatorios.

## Rol De Codex En Operacion

Codex debe funcionar como copiloto operativo:

- Preparar planes de staging.
- Ejecutar validaciones no destructivas.
- Analizar logs, tests y reportes.
- Crear y mantener automatizaciones.
- Detectar regresiones despues de deploy.
- Priorizar backlog segun impacto real.
- Ayudar a convertir datos diarios en decisiones.

Regla practica:

- Antes de launch, Codex ayuda a reducir riesgo.
- Durante launch, Codex ayuda a detectar problemas rapido.
- Despues de launch, Codex ayuda a mejorar conversion y estabilidad.

## Proxima Conversacion Recomendada

Abrir en modo plan con este objetivo:

```text
Entra en modo plan.

Quiero cerrar la siguiente fase de NGX Transform: validacion staging real y launch gate final.

Contexto:
- Repo: /Users/aldoolivas/genesis-scann
- Documento operativo: docs/LAUNCH_OPERATIONS.md
- Runbook P1/P2: docs/qa/P1_P2_RELEASE_READINESS_RUNBOOK.md
- Checklist: docs/RELEASE_CHECKLIST.md

Restricciones:
- No commits.
- No produccion.
- No APIs pagadas reales.
- Usar staging controlado o mocks.
- Delete solo en fixture desechable.
- Priorizar seguridad, privacidad y launch readiness.

Necesito un plan decision-complete para:
- fixtures Firebase staging,
- test:auth/test:smoke contra staging,
- owner/non-owner/anonymous matrix,
- delete owner + delete token legacy,
- telemetry public isolation,
- visual QA staging,
- herramientas de observabilidad,
- dominio/hosting,
- automatizaciones Codex,
- Go/No-Go final.
```
