# Anexo — Mapa de arquitectura REAL (Fase 0)

> Fuente de verdad: el CÓDIGO leído en esta auditoría (junio 2026). La documentación del repo (CLAUDE.md, AGENTS.md, STATUS_REPORT.md) describe un producto que ya no existe — ver sección "Deuda documental".
> Repo: 138 commits (sep 2025 → jun 2026), ~38,400 líneas de TypeScript en `src/`, 12 PRs mergeadas.

## 1. Qué es el producto HOY (según el código)

Lead magnet viral: el usuario sube una foto + perfil → Gemini genera análisis y 3 imágenes de proyección (m4/m8/m12) → página de resultados compartible → **conversión a "HYBRID" con pago real vía MercadoPago** (suscripción monthly/quarterly/annual en MXN), con alternativas de Calendly, WhatsApp y "brief" por email, más un agente de voz con OpenAI Realtime.

**El funnel documentado (Genesis Demo → Plan Preview) está MUERTO**: `/s/[shareId]/demo` y `/s/[shareId]/plan` son redirects a `/s/{shareId}#hybrid-offer` (src/app/s/[shareId]/demo/page.tsx:22, src/app/s/[shareId]/plan/page.tsx:22).

## 2. Flujo real del usuario

```
/  ó  /j (jóvenes)  ó  /m (mayores)          ← 3 landings por segmento
   ↓
/wizard (4 etapas: Foto → Perfil → Objetivo → Cierre; el EMAIL se pide al FINAL, no al inicio)
   - sube foto directo a Firebase Storage desde el navegador (src/app/wizard/page.tsx:515-522)
   - POST /api/sessions → POST /api/analyze en background (:541, :571-584)
   ↓
/loading/[shareId]  — sondea cada 3s; al estar "analyzed" dispara POST /api/generate-images
   ↓
/s/[shareId]  — PÁGINA ÚNICA de resultados + conversión:
   TransformationViewer2 → MuscleHealthScore → TransformationSummary →
   SeasonRoadmap → HybridVoiceAgent (flag) → HybridOfferV2 (LA conversión)
   ↓
HybridOfferV2 → POST /api/checkout/create-preference → redirect a MercadoPago
   ↓
/checkout/success | /checkout/failure | /checkout/pending  ← retorno de MP
   (el webhook POST /api/checkout/webhook confirma el pago server-to-server)
```

Cuenta/privacidad: `/auth` (Firebase email+Google) → `/dashboard` (lista sesiones, toggles de share) → `/dashboard/[shareId]` (borrado). `/unsubscribe` para bajas de email.

## 3. Stack y servicios externos (verificados)

| Capa | Tecnología | Evidencia |
|---|---|---|
| Framework | Next.js **16.2.4** App Router + React 19.1.2 + TS strict | package.json:43-45, tsconfig.json:11 |
| Estilos | Tailwind v4 (CSS-first, sin tailwind.config) + shadcn parcial | postcss.config.mjs, src/app/globals.css |
| Datos | Firestore vía **Admin SDK únicamente** (reglas deny-all) | firestore.rules:15-22 |
| Archivos | Firebase Storage (uploads del usuario + imágenes generadas vía signed URLs) | storage.rules, src/lib/storage.ts |
| IA texto | Gemini (@google/generative-ai 0.24.1) — análisis, plan, reporte | src/lib/gemini.ts |
| IA imagen | Gemini Image / NanoBanana, con Identity Chain | src/lib/nanobanana.ts, imageConfig.ts |
| IA voz | **OpenAI Realtime (WebRTC)** — NO ElevenLabs | src/app/api/realtime/session/route.ts, HybridVoiceAgent.tsx:28,225 |
| Pagos | **MercadoPago Checkout Pro** (SKUs HYBRID en MXN) | src/lib/mercadoPago.ts, src/app/api/checkout/* |
| Email | Resend (transaccional + secuencia D0-D14, 7 templates) | src/emails/, src/lib/emailScheduler.ts |
| Automatización | Webhooks a n8n (lead_captured, transform_completed, lead_classified…) | src/lib/n8nWebhook.ts |
| Rate limiting | Upstash Redis + fallback in-memory + transacción Firestore | src/lib/rateLimit.ts |
| Observabilidad | Sentry **configurado pero probablemente inerte** (sin instrumentation.ts ni DSN) | sentry.*.config.ts; ver hallazgos |
| Hosting | Vercel (deploy por integración git; sin workflow de deploy en el repo) | vercel.json |

## 4. Superficie de API: 35 endpoints

Inventario completo con auth/validación/rate-limit por ruta en el reporte de hallazgos. Resumen:

- **Con auth de usuario** (requireAuth/requireSessionOwner): analyze*, generate-images*, plan, sessions(POST), sessions/me, private, share-settings, classify, feedback, brief/send, checkout/create-preference, events/hybrid-offer, realtime/session, email. (*analyze y generate-images aceptan además un worker token interno.)
- **Server-to-server** (CRON_API_KEY / worker token): cron/cleanup, email/send, email/sequence, pipeline, report, counter(POST), remarketing(GET), referral(complete/claim).
- **Públicos por diseño**: sessions/[shareId] GET (PII filtrada por allowlist + shareScope), og, social-pack, unlock, leads, telemetry, csp-report, counter GET, referral(visit), remarketing POST, checkout/webhook (firma HMAC).
- **Punto débil notable**: `/api/generate-plan` (GET+POST) sin auth ni ownership — ver hallazgos.

Colecciones Firestore reales: sessions, jobs, session_metrics, gemini_spend, rate_limits, rate_limits_email, telemetry_events, leads, remarketing_leads, feedback, referrals, email_sequences, email_suppressions, counters, transform_reports, _health_check.

## 5. Seguridad estructural (lo que está bien hecho)

- Firestore deny-all: el cliente NUNCA toca la base; todo pasa por el backend (firestore.rules:15-22).
- `requireSessionOwner` consistente en rutas privadas (src/lib/authServer.ts:102-129).
- Comparaciones de secretos timing-safe (src/lib/crypto.ts:23 — timingSafeEqual).
- Webhook MercadoPago: valida firma HMAC, re-consulta el pago a la API de MP, valida monto/moneda/SKU, idempotente (src/app/api/checkout/webhook/route.ts:40-100,151,190-241). Forjar un pago aprobado no es viable.
- Precio server-side: el cliente solo manda el SKU enum (src/lib/mercadoPago.ts:73-106).
- GET público de sesión: allowlist de campos + shareScope privado-por-defecto.
- Anti-spoofing de IP en rate limiting (rateLimit.ts:364-385) y validación exacta de Origin en /api/* (src/proxy.ts:130-156).
- Guard de deploy: el build de producción FALLA si faltan los datos legales del responsable (next.config.ts:7, src/lib/legalConfig.ts:50-59).

## 6. CI/CD y operación

- **CI** (.github/workflows/ci.yml): lint + tsc + build (con placeholders) + 34 tests Vitest. **NO corre** los tests de integración de authz (tests/*.mjs — solo gate local manual `pnpm test:gate:local` con emulador Firebase), ni deploy de reglas Firebase, ni audit de dependencias.
- **Deploy**: integración git de Vercel; sin staging visible en el repo; rollback = el de Vercel.
- **Crons**: vercel.json NO define crons → `/api/cron/cleanup` (retención de datos) y la secuencia de emails no tienen disparador dentro del repo.
- **Sentry**: config escrita y con scrub de PII, pero sin `instrumentation.ts` que la cargue (requisito de @sentry/nextjs v10 + Next 16) y sin DSN en ningún env → hoy nadie se entera si producción truena.

## 7. Deuda documental y código muerto (inventario)

| Qué | Realidad | Evidencia |
|---|---|---|
| CLAUDE.md "cd app/" | No existe carpeta app/; código en src/ raíz | CLAUDE.md:77,370 |
| /api/genesis-demo, genesis-chat, genesis-voice | No existen (3 rutas fantasma) | CLAUDE.md:145-147 |
| genesis-demo/agents.ts, genesis-orchestrator.ts, elevenlabs-voice.ts, types/genesis.ts | No existen | CLAUDE.md:118-123,267 |
| src/components/genesis/, demo/, widgets/ (15+ componentes doc.) | Directorios no existen | CLAUDE.md:233-260 |
| Funnel "Genesis Demo → Plan Preview" | Redirects; conversión real = HybridOfferV2 + MercadoPago | s/[shareId]/plan/page.tsx:1-10 |
| Checkout MercadoPago, n8n, OpenAI Realtime, Sentry | **Existen y NO están documentados** (grep "Mercado" en CLAUDE/README/AGENTS: 0 hits) | src/lib/mercadoPago.ts |
| Flags fantasma NEXT_PUBLIC_FF_RESULTS_2, FF_HYBRID_OFFER_V2 | 0 usos en código | .env.example:132,137 |
| Límites de gasto "$50/día, $10/hora" | .env.example dice $250/día, $20/hora | .env.example:24-25 |
| CSP "nonce-based + strict-dynamic" | Real: 'unsafe-inline' + Report-Only en paralelo | src/proxy.ts:15-21,121-127 |
| STATUS_REPORT.md / PLAN.md | Fotos viejas; casi todo lo "faltante" ya está hecho | STATUS_REPORT.md:183-185 |
| CHANGELOG.md | ~4 meses sin actualizar (no registra rebrand, checkout, colapso de funnel) | CHANGELOG.md |
| ngx-liquid-glass-ds/ (84 archivos, 4.4MB) | Vendoreado solo como referencia; 0 imports desde src/ | grep: solo 2 comentarios en globals.css |
| docs/qa + docs/audit-uiux-2026-05 (~35MB de imágenes) | Peso muerto trackeado en git | 89 archivos |
| Componentes muertos | ~33 de 96 (34%): CinematicViewer, NeonRadar, OverlayImage, cluster TransformationViewer v1 (5), 13 secciones de landing no renderizadas, kit ui duplicado | grep de importadores |

## 8. Tests: qué protege y qué decora

- 34 archivos Vitest corren en CI; los mejores: pagos MercadoPago (10 tests, firma HMAC real, idempotencia, mismatches), telemetría/trust, reporte PDF, validators.
- ~13 de 34 son tests "de substring" (leen el fuente como texto): detectan retrocesos burdos, no bugs.
- **Los tests de authz A-vs-B (los más importantes) NO corren en CI** — viven en tests/*.mjs y se saltan en silencio sin fixtures; dependen del gate local manual.
- Sin ningún test: creación de sesión, analyze, generate-images real, spendLimiter/aiKillSwitch (la protección de costo), emails, plan, viral/unlock, authServer.ts.
