# Hallazgos — NGX Vision (ordenados por impacto × urgencia)

> **Método:** 12 auditores especializados + 3 auditorías de huecos produjeron 124 hallazgos brutos; cada uno fue verificado por agentes adversariales independientes leyendo el código citado (los CRÍTICOS con doble verificador). Resultado: **113 confirmados** (1 🔴, 32 🟠, 55 🟡, 25 🟢), 1 refutado y 10 duplicados fusionados. Numeración `#NN` = ID interno de auditoría; cada CRÍTICO/ALTO tiene su prompt de remediación en [fixes/](fixes/).
> Severidades: 🔴 CRÍTICO (dinero/datos/legal/caída) · 🟠 ALTO (frena crecimiento) · 🟡 MEDIO · 🟢 BAJO.

---

## TOP 14 por riesgo real

### 1. 🔴 Cobras y no entregas nada — y nadie se entera (#53, #1014) — `fix-01`
**Qué es:** cuando MercadoPago confirma un pago, el webhook solo escribe `hybridStatus: "converted"` en Firestore y un evento de telemetría. No envía el email de bienvenida que la página de éxito promete ("Email de bienvenida con tu acceso (5–10 min)", "tu coach te contactará en menos de 24h"), no existe ninguna plantilla de bienvenida (grep de welcome/bienvenida: 0 hits fuera del copy), y no notifica al equipo (el webhook de n8n que sí se usa para leads no se llama aquí). Aplica igual al flujo pending→approved (OXXO/SPEI, muy común en México).
**Negocio:** un cliente paga $2,999–$24,999 MXN y recibe NADA automáticamente; tú te enteras solo si miras Firestore a mano. Receta directa para reclamos y contracargos (que además penalizan tu cuenta de MP) en los primeros días de operación.
**Evidencia:** [checkout/success/page.tsx:47-60](../src/app/checkout/success/page.tsx), [checkout/webhook/route.ts:265-268](../src/app/api/checkout/webhook/route.ts), [email/send/route.ts:146-148](../src/app/api/email/send/route.ts). **Esfuerzo:** 1-3d.

### 2. 🟠 Vendes "suscripción mensual renovable" pero el código solo cobra UNA vez (#1011, #1012, #1013) — `fix-05`, `fix-06`
**Qué es:** los SKUs monthly/quarterly/annual se cobran vía Checkout Pro (pago único); grep de preapproval/auto_recurring/subscription en src/: 0 hits. El item de MP dice literalmente "Renovable." y la UI muestra "$X / mes". El entitlement solo conoce `prospect → converted`, permanente: sin vigencia, sin expiración, sin renovación, sin churn medible.
**Negocio:** tu MRR proyectado está estructuralmente inflado (el "mensual" paga 1x, no 12x), no puedes distinguir clientes activos de vencidos, y prometer "renovable / mes" sin recurrencia es riesgo PROFECO/contracargo en ambas direcciones.
**Evidencia:** [mercadoPago.ts:11,54-66,174-186](../src/lib/mercadoPago.ts), [HybridOfferV2.tsx:196,206-223](../src/components/results/HybridOfferV2.tsx), [sessions/route.ts:154-155](../src/app/api/sessions/route.ts). **Esfuerzo:** copy <1d; recurrencia >1sem.

### 3. 🟠 Identidad anónima irrecuperable: el que paga puede perder el acceso para siempre (#1006, #1007, #1008, #1009, #1010, #73) — `fix-07`, `fix-08`, `fix-09`
**Qué es:** todo el funnel vive sobre `signInAnonymously` atado al dispositivo; no existe linkWithCredential, claim por email ni magic link (grep: 0 hits). Consecuencias encadenadas y verificadas: el email de recuperación lleva a un muro de privacidad en otro dispositivo; pagar exige la "sesión original" (401/403 si la cookie expiró); el entitlement pagado queda atado al uid efímero; el login de /auth crea un uid distinto con dashboard vacío; y el deleteToken jamás se entrega al usuario → el borrado de datos (ARCO/LFPDPPP) es inejecutable en la práctica.
**Negocio:** conversión perdida en el momento de mayor intención, clientes pagados bloqueados → contracargos, y exposición legal directa (fotos corporales + datos de salud sin mecanismo efectivo de borrado para el titular).
**Evidencia:** [firebaseClient.ts:37-41](../src/lib/firebaseClient.ts), [sessions/route.ts:153,232-235](../src/app/api/sessions/route.ts), [create-preference/route.ts:23](../src/app/api/checkout/create-preference/route.ts), [auth/session/route.ts:28-29](../src/app/api/auth/session/route.ts), [auth/page.tsx:58-77](../src/app/auth/page.tsx). **Esfuerzo:** 1sem (raíz) + 1-3d (mitigaciones).

### 4. 🟠 Producción ciega: Sentry nunca se inicializa y no hay ningún alerting (#82) — `fix-11`
**Qué es:** los configs de Sentry existen (bien diseñados, con scrub de PII) pero no hay `instrumentation.ts` que los cargue (requisito de @sentry/nextjs v10 + Next 16; grep de imports: 0) y el DSN está vacío en todos los env. No hay captureException en ninguna ruta, ni monitor de uptime, ni otro proveedor.
**Negocio:** si el sitio se cae o los pagos dejan de procesarse a las 3am, nadie recibe aviso — te enteras por un cliente. En un producto viral, horas de caída silenciosa = perder el pico que justifica todo.
**Evidencia:** [sentry.server.config.ts:33-36](../sentry.server.config.ts), [.env.example:177-179](../.env.example), grep instrumentation = 0 archivos. **Esfuerzo:** <1d.

### 5. 🟠 Next.js 5 parches atrás con 13 avisos de seguridad publicados (#92) — `fix-12`
**Qué es:** next@16.2.4 tiene 13 advisories (6 high: DoS por Server Components, bypass del middleware vía segment-prefetch — CVE-2026-44575/45109 —, SSRF, DoS de image optimization). El bypass anula exactamente la capa de CSP/headers/Origin que vive en src/proxy.ts. Parche disponible desde 16.2.5/16.2.6 (actual: 16.2.9). Verificado con `pnpm audit` + registro de advisories por dos agentes independientes.
**Negocio:** con técnicas ya públicas te pueden tumbar el sitio en pleno pico viral. El arreglo es subir un número de versión y redesplegar.
**Evidencia:** [package.json:43](../package.json), [proxy.ts:162-171](../src/proxy.ts). **Esfuerzo:** <1d.

### 6. 🟠 La pantalla de carga atrapa usuarios sin salida en el punto más caro del funnel (#11, #62, #72) — `fix-20`
**Qué es:** si falla 1 de 3 imágenes, la sesión queda en `partial` y el cliente solo maneja `failed` (error+retry) y `ready` (redirect): con `partial` el usuario ve 75% para siempre — aunque la página de resultados SÍ sabe mostrar sesiones partial. Además, cualquier fallo del disparo de generación distinto de 2 strings exactos solo va a console.error (sin mensaje, sin retry, flag que impide reintentar), no hay timeout máximo de polling, y si el analyze del wizard falla, el loader gira eternamente.
**Negocio:** cada fallo parcial = ~$0.27-0.40 de IA ya pagados + un lead quemado en silencio, justo cuando el límite de gasto o el rate limit se activan (pico viral). Nadie lo ve porque no hay error visible ni telemetría del estado.
**Evidencia:** [generate-images/route.ts:488-489](../src/app/api/generate-images/route.ts), [LoadingExperience.tsx:181-188,208-216,223-227,246-247](../src/app/loading/[shareId]/LoadingExperience.tsx), [s/[shareId]/page.tsx:235](../src/app/s/[shareId]/page.tsx). **Esfuerzo:** <1d-1-3d.

### 7. 🟠 El "viral" del lead magnet viral es fachada: K-factor 0 por construcción (#1000, #1001, #1002, #1003, #1004) — `fix-28`, `fix-29`
**Qué es:** (a) referidos rotos en 4 puntos independientes: nadie lee `?ref=` (grep: 0 lectores), ReferralCard solo se renderiza con `!isLeadMagnet` pero la página siempre pasa `surfaceMode="lead-magnet"`, y la recompensa exige una acción con CRON_API_KEY que nada invoca; (b) share-to-unlock es doble fachada: el modal nunca llama a /api/unlock (solo telemetría) y el "desbloqueo" es localStorage, además de inalcanzable; (c) el social pack no tiene ni un consumidor; (d) 7 endpoints públicos sin ningún caller en el producto.
**Negocio:** la tesis de crecimiento declarada (compartición/referidos) no opera: todo tu CAC es adquisición directa. Las proyecciones de crecimiento viral no tienen soporte en el código.
**Evidencia:** [ReferralCard.tsx:25](../src/components/ReferralCard.tsx), [TransformationViewer2.tsx:526,547-553](../src/components/TransformationViewer2.tsx), [s/[shareId]/page.tsx:271-280](../src/app/s/[shareId]/page.tsx), [ShareToUnlockModal.tsx:88-144](../src/components/viral/ShareToUnlockModal.tsx), [referral/route.ts:123-126](../src/app/api/referral/route.ts). **Esfuerzo:** 1sem (conectar) o 1-3d (eliminar).

### 8. 🟠 El freno de gasto de IA cuenta mal y nadie lo prueba (#9, #15, #101) — `fix-14`, `fix-25`
**Qué es:** el spend limiter reserva $0.268/sesión usando un precio "batch" que no existe (todo va por el endpoint síncrono; grep de API batch: 0), los reintentos (hasta 3 llamadas reales por imagen) no se contabilizan — peor caso ~$1.21 real vs $0.268 contado — y hay 3 tablas de precios desincronizadas. Además spendLimiter/aiKillSwitch/jobManager no tienen ni un test ejecutable.
**Negocio:** cuando tu contador diga $50/día, la factura real de Gemini puede ir en $75-150+, multiplicándose en picos con fallos del proveedor. Es la protección financiera principal del negocio y nada verifica que funcione.
**Evidencia:** [imageConfig.ts:165-172,203-207](../src/lib/imageConfig.ts), [nanobanana.ts:301-305](../src/lib/nanobanana.ts), [generate-images/route.ts:55,294-318](../src/app/api/generate-images/route.ts), [analyze/route.ts:128](../src/app/api/analyze/route.ts). **Esfuerzo:** 1-3d.

### 9. 🟠 Una env var mal puesta brickea el producto entero (footgun 503) (#10) — `fix-15`
**Qué es:** con flags por defecto (FF_IDENTITY_CHAIN=true + FF_NB_PRO=false) el modelo de imagen default no soporta Identity Chain y generate-images responde 503 `identity_chain_model_unsupported` al 100% — antes de generar nada. Un deploy a Vercel sin FF_NB_PRO=true (o el modelo Pro explícito) apaga las transformaciones para todos, visible solo en logs del servidor. El TODO "[P1] Investigar fallo en generación" de nanobanana.ts sugiere que ya ocurrió.
**Negocio:** el corazón del producto depende de que una env var esté bien escrita en Vercel, sin validación al arranque ni alarma cuando pasa (se combina con el hallazgo #4: producción ciega).
**Evidencia:** [validators.ts:229-230](../src/lib/validators.ts), [generate-images/route.ts:210-221](../src/app/api/generate-images/route.ts), [imageConfig.ts:239-242](../src/lib/imageConfig.ts), [nanobanana.ts:15-17](../src/lib/nanobanana.ts). **Esfuerzo:** <1d.

### 10. 🟠 Fotos corporales y datos de salud retenidos para siempre; borrado incompleto (#23, #21, #22) — `fix-10`
**Qué es:** (a) el cron de cleanup excluye explícitamente sesiones completadas — no existe TTL para las exitosas: foto, edad, peso, estrés se guardan indefinidamente; (b) las fotos subidas antes de crear sesión quedan huérfanas en uploads/ y nada las barre; (c) el DELETE de sesión no borra transform_reports, el PDF en reports/, ni la secuencia de emails (que sigue mandando marketing a quien borró sus datos); (d) el cron además no tiene disparador (vercel.json sin "crons").
**Negocio:** la categoría de dato más delicada del producto crece sin límite (universo de brecha cada vez mayor), contradice el aviso de privacidad, e incumplir cancelación bajo LFPDPPP es sancionable por el INAI; los correos post-borrado son quema directa de dominio y reputación.
**Evidencia:** [cron/cleanup/route.ts:83-110](../src/app/api/cron/cleanup/route.ts), [wizard/page.tsx:515](../src/app/wizard/page.tsx), [sessions/[shareId]/route.ts:142-152](../src/app/api/sessions/[shareId]/route.ts), [emailScheduler.ts:63-77](../src/lib/emailScheduler.ts), [vercel.json:1-9](../vercel.json). **Esfuerzo:** 1-3d.

### 11. 🟠 Sin libro de órdenes + reembolsos invisibles + pagos legítimos rechazados (#55, #54, #56) — `fix-02`, `fix-03`, `fix-04`
**Qué es:** (a) el único registro de un pago vive anidado en la sesión, se sobreescribe con cada intento de checkout y el cron puede borrarlo (su double-check nunca mira checkout/hybridStatus); no hay colección payments ni índice por paymentId → conciliar contra MP es imposible; (b) las notificaciones de refund/chargeback llegan con el mismo paymentId y la idempotencia las descarta (`alreadyProcessed`) — un test codifica este comportamiento como correcto; (c) si el usuario cambia de SKU antes de pagar (u ocurre un cambio de precio), el pago aprobado real se rechaza con 409 y nunca se registra: dinero cobrado a un cliente que no figura como venta.
**Negocio:** cierre de mes y SAT sin fuente de verdad; contracargos perdidos por default (plazos cortos de MP); y el peor caso posible: cobrarle a alguien sin saber que le debes algo.
**Evidencia:** [create-preference/route.ts:88-103](../src/app/api/checkout/create-preference/route.ts), [checkout/webhook/route.ts:190-195,199,201-214,243-246](../src/app/api/checkout/webhook/route.ts), [cron/cleanup/route.ts:83,107](../src/app/api/cron/cleanup/route.ts). **Esfuerzo:** 1-3d c/u.

### 12. 🟠 Móvil roto donde más duele: 10.8MB en la espera y CTA principal bloqueado en iOS (#63, #64) — `fix-21`, `fix-22`
**Qué es:** (a) el orbe decorativo descarga orb.riv (8.9MB) + rive.wasm (1.85MB) en la pantalla de carga que ve el 100% de los usuarios; cero next/dynamic o React.lazy en todo src/ (grep: 0); (b) los CTAs de Calendly/WhatsApp hacen `window.open` después de awaits de red → popup blocker en iOS Safari: el usuario toca el botón principal de conversión y no pasa nada.
**Negocio:** en 4G son 15-20s extra de espera y ~11MB del plan de datos del usuario; y en iPhone (el dispositivo dominante del tráfico de Instagram/TikTok) el camino de venta principal parece un botón roto — depresión invisible de conversión.
**Evidencia:** [RiveOrb.tsx:9,41-49](../src/components/RiveOrb.tsx), ls -la public/orb.riv = 8,943,320 bytes, [HybridOfferV2.tsx:289-301](../src/components/results/HybridOfferV2.tsx). **Esfuerzo:** <1d (CTA) + 1-3d (peso).

### 13. 🟠 La seguridad que importa no se prueba en CI (#100, #102, #103) — `fix-24`, `fix-26`, `fix-27`
**Qué es:** los únicos tests reales de "usuario B no puede ver/borrar lo del usuario A" viven en tests/*.mjs que NO corren en CI y se saltan en silencio sin fixtures (t.skip → verde sin probar nada); la única cobertura en CI de esos invariantes es un test que busca la palabra "requireSessionOwner" como substring; authServer.ts (el corazón de la authz) jamás se ejecuta en ningún test; y los flujos núcleo (crear sesión, analyze, generate-images real) tienen cero tests de comportamiento.
**Negocio:** una regresión de permisos llegaría a producción con el CI en verde — y aquí "regresión de permisos" significa fotos del cuerpo y datos de salud de un usuario visibles para otro.
**Evidencia:** [ci.yml:49-53](../.github/workflows/ci.yml), [auth.integration.test.mjs:13-17](../tests/auth.integration.test.mjs), [security-p1.static.test.ts:10-19](../src/app/api/security-p1.static.test.ts). **Esfuerzo:** 1-3d.

### 14. 🟠 Upstash gratis se agota en un día viral y apaga la generación (#85, #18) — `fix-23`
**Qué es:** cada evento de telemetría pública (10 emisores en el cliente) consume un viaje a Redis; el recorrido completo de un usuario son ~15-25 comandos, no ~6: el free tier (10K ops/día) se agota entre ~400-700 usuarios/día, no los "~1,600" que dice CLAUDE.md. Al fallar Redis, los endpoints críticos (analyze, generate-images, plan) fallan CERRADOS por diseño: la generación se apaga. Combinado con el límite de gasto default ($50/día ≈ 186 usuarios), tu techo real de un día viral es de unos cientos de usuarios.
**Negocio:** el producto se apaga exactamente en el momento que justifica su existencia (el pico viral). Arreglo barato: plan pago de Upstash + sacar telemetría del rate limit por Redis + subir límites de gasto con conocimiento de causa.
**Evidencia:** [CLAUDE.md:510](../CLAUDE.md), [rateLimit.ts:105-109,211-218,327-336](../src/lib/rateLimit.ts), [spendLimiter.ts:19-20](../src/lib/spendLimiter.ts). **Esfuerzo:** <1d.

---

## Resto de ALTOS 🟠 (cada uno con su fix en [fixes/](fixes/))

| # | Hallazgo | Evidencia | Esfuerzo | Fix |
|---|---|---|---|---|
| 12 | Llamadas a Gemini sin timeout: un cuelgue del proveedor congela el job 10 min con el usuario mirando la carga | [nanobanana.ts:300-305](../src/lib/nanobanana.ts), [jobManager.ts:152-156](../src/lib/jobManager.ts) | <1d | fix-16 |
| 13 | Quality gates decorativos (solo bytes/MIME; face/identity drift definidos pero sin detector) y retry correctivo que es código muerto | [qualityGates.ts:43-47,119-124](../src/lib/qualityGates.ts), [nanobanana.ts:280-281](../src/lib/nanobanana.ts) | 1sem | fix-17 |
| 14 | El PDF descargable usa `generateSamplePlan` ("for testing") e ignora el plan IA; macros con 70kg hardcodeado | [generate-plan/route.ts:75](../src/app/api/generate-plan/route.ts), [planGenerator.ts:155](../src/lib/plan/planGenerator.ts) | 1-3d | fix-18 |
| 32 | La secuencia de emails D0-D14 no tiene disparador en el repo, sin guard anti-duplicados (hasSentStage: 0 consumidores) ni transacción | [emailScheduler.ts:112-138,206-208](../src/lib/emailScheduler.ts), [vercel.json](../vercel.json) | 1-3d | fix-19 |
| 93 | El SDK de IA del corazón del producto (@google/generative-ai) está abandonado: repo archivado, sin parches; reemplazo oficial @google/genai | [package.json:22](../package.json), [gemini.ts:11](../src/lib/gemini.ts) | 1-3d | fix-13 |

## MEDIOS 🟡 (55 — los 20 más relevantes; inventario completo verificado)

| # | Hallazgo | Evidencia | Esfuerzo |
|---|---|---|---|
| 1005 | Subsistema de plan 7 días huérfano; la entrega post-compra que el código promete en comentarios no existe | [s/[shareId]/plan/page.tsx:1-23](../src/app/s/[shareId]/plan/page.tsx) | 1-3d |
| 57 | /checkout/success afirma "Pago confirmado" sin verificar nada (MP puede redirigir con pago rechazado) | [checkout/success/page.tsx:6-11](../src/app/checkout/success/page.tsx) | 1-3d |
| 59 | Sin facturación fiscal (CFDI México): se cobra en MXN sin ruta de comprobante | [mercadoPago.ts:163](../src/lib/mercadoPago.ts) | 1sem |
| 2 | Secretos críticos sin valor en ningún env (MP_WEBHOOK_SECRET, CRON_API_KEY, UNSUBSCRIBE_SECRET…): checkout/crons/bajas morirían con 503/401 si en Vercel tampoco están | [checkout/webhook/route.ts:107-111](../src/app/api/checkout/webhook/route.ts) | <1d |
| 42 | shareId de 48 bits como token portador de todo el contenido público, sin rate limit en varios GET | [sessions/route.ts:143](../src/app/api/sessions/route.ts) | <1d |
| 48 | Fotos sin validación de contenido real (magic bytes) y SVG con JavaScript permitido en el upload | [storage.rules:7-10](../storage.rules) | 1-3d |
| 44 | remarketing POST escribe en cualquier sesión por shareId sin autenticación | [remarketing/route.ts:95-100](../src/app/api/remarketing/route.ts) | <1d |
| 25 | La secuencia de marketing no verifica el opt-in de marketing en código (consents.marketing se guarda pero nadie lo lee) | [email/sequence/route.ts:69-83](../src/app/api/email/sequence/route.ts) | <1d |
| 28 | El consentimiento del wizard no menciona expresamente los datos sensibles de salud (LFPDPPP exige consentimiento expreso) | [WizardConsentPanel.tsx:59](../src/components/wizard/WizardConsentPanel.tsx) | <1d |
| 24 | El aviso de privacidad no declara transferencias reales (MercadoPago, n8n, Sentry) | [privacy/page.tsx:170-190](../src/app/privacy/page.tsx) | <1d |
| 27 | La foto corporal se firma por 14 días y se incrusta en un email reenviable | [brief/send/route.ts:207-216](../src/app/api/brief/send/route.ts) | <1d |
| 17 | El prompt ordena fabricar una "edad biológica" siempre distinta a la real (dato inventado presentado como análisis) | [gemini.ts:200](../src/lib/gemini.ts) | <1d |
| 65 | Cero error.tsx/loading.tsx/not-found.tsx en todo src/app: excepciones muestran pantalla genérica sin marca | find src/app = 0 archivos | <1d |
| 67 | Los feature flags del visor nunca se pasan del servidor: los FF_* de Vercel para reveal/slider/letter no tienen efecto | [TransformationViewer2.tsx:108-116](../src/components/TransformationViewer2.tsx) | <1d |
| 76 | Copy interno de developers visible en la zona de compra ("Flag activo", "Visible solo cuando el equipo habilite…") | [HybridOfferV2.tsx:647-649](../src/components/results/HybridOfferV2.tsx) | <1d |
| 78 | El wizard pierde todo el progreso al recargar y el botón "Atrás" del header expulsa del flujo | [wizard/page.tsx:168](../src/app/wizard/page.tsx) | 1-3d |
| 79 | Dashboard: sesiones fallidas aparecen como "Procesando..." para siempre | [dashboard/page.tsx:159-161](../src/app/dashboard/page.tsx) | <1d |
| 86 | CI no corre integración ni despliega reglas Firebase (deploy de reglas 100% manual, sin registro) | [ci.yml:52-53](../.github/workflows/ci.yml) | 1-3d |
| 90 | Sin validación central de env vars: una variable faltante crashea en runtime, no en deploy | [imageConfig.ts:217-218](../src/lib/imageConfig.ts) | 1-3d |
| 91 | Generación secuencial con reintentos vs maxDuration 180s: jobs cortados a la mitad en el peor caso | [generate-images/route.ts:53-55](../src/app/api/generate-images/route.ts) | 1-3d |

<details><summary><b>Resto de MEDIOS (35)</b></summary>

| # | Hallazgo | Evidencia |
|---|---|---|
| 15 | reserveSpend antes de acquireJobLock sin reembolso: presupuesto inflado por requests rechazados | [generate-images/route.ts:294-318](../src/app/api/generate-images/route.ts) |
| 16 | GEMINI_API_KEY viaja como query param (acaba en logs/proxies) | [imageConfig.ts:216-221](../src/lib/imageConfig.ts) |
| 18 | Capacidad ~186 usuarios/día con límites default de gasto | [spendLimiter.ts:19-20](../src/lib/spendLimiter.ts) |
| 22 | Cron de limpieza sin disparador (vercel.json sin crons) | [vercel.json:1-9](../vercel.json) |
| 30 | Dos sistemas de plan paralelos que no se comunican | [generate-plan/route.ts:75](../src/app/api/generate-plan/route.ts) |
| 31 | Macros con 70kg hardcodeado y bodyType siempre "mesomorph" | [planGenerator.ts:155](../src/lib/plan/planGenerator.ts) |
| 33 | Validación de dueño copiada/pegada entre analyze y generate-images, ya con deriva | [analyze/route.ts:98-101](../src/app/api/analyze/route.ts) |
| 34 | 5 implementaciones distintas de auth por CRON_API_KEY; una acepta el secreto en el body | [counter/route.ts:57-61](../src/app/api/counter/route.ts) |
| 35 | Read-modify-write sin transacción en referidos/webhook/brief/unlock | [referralTracking.ts:53-70](../src/lib/viral/referralTracking.ts) |
| 37 | Contador social: agregaciones Firestore por visita sin caché + fallback que descarga la colección | [counter/route.ts:27-36](../src/app/api/counter/route.ts) |
| 38 | Formato de error inconsistente; fallos que responden HTTP 200 | [generate-images/route.ts:533-539](../src/app/api/generate-images/route.ts) |
| 58 | Sandbox/producción de MP por NODE_ENV, sin guard de credenciales TEST- | [create-preference/route.ts:116-117](../src/app/api/checkout/create-preference/route.ts) |
| 66 | DramaticReveal sin precarga; ninguna imagen usa next/image | [DramaticReveal.tsx:88-98](../src/components/results/DramaticReveal.tsx) |
| 68 | ~34% de componentes muertos (CinematicViewer, NeonRadar, cluster Viewer v1, 13 secciones landing, kit ui duplicado) | [CinematicViewer.tsx](../src/components/CinematicViewer.tsx) |
| 69 | Sliders del wizard sin nombre accesible ni foco visible; ~80 textos con contraste insuficiente | [CyberSlider.tsx:73-78](../src/components/CyberSlider.tsx) |
| 77 | Pagar/brief exigen "sesión original" con mensaje críptico | [HybridOfferV2.tsx:247-250](../src/components/results/HybridOfferV2.tsx) |
| 81 | Foto sin validación de "hay una persona": imágenes basura gastan IA completa | [wizard/page.tsx:401-405](../src/app/wizard/page.tsx) |
| 87 | /api/counter sin caché ni auth en GET (costo Firestore por visita) | [counter/route.ts:17-23](../src/app/api/counter/route.ts) |
| 88 | /api/health exige API key en prod y cada ping escribe en Firestore: inservible para uptime externo | [health/route.ts:190-197](../src/app/api/health/route.ts) |
| 89 | Telemetría rica sin panel: datos del funnel que nadie puede ver | [telemetry.ts:195-200](../src/lib/telemetry.ts) |
| 94 | pnpm.overrides pin-and-forget (protobufjs fijado en versión vulnerable) | [package.json:69-77](../package.json) |
| 95 | pnpm audit --prod: 17 vulnerabilidades (9 high — la mayoría se van con el upgrade de Next) | [pnpm-lock.yaml](../pnpm-lock.yaml) |
| 99 | Sin Dependabot/Renovate | [.github/workflows/ci.yml](../.github/workflows/ci.yml) |
| 104 | mercadoPago.ts real jamás se ejecuta en tests (parser de external_reference re-implementado en el mock) | [webhook/route.test.ts:13-22](../src/app/api/checkout/webhook/route.test.ts) |
| 105 | checkRateLimit/Upstash (fail-open vs fail-closed) sin ningún test | [rateLimit.test.ts](../src/lib/rateLimit.test.ts) |
| 106 | Cero tests e2e pese a Playwright instalado | [package.json:62](../package.json) |
| 107 | Emails y webhook n8n sin tests de comportamiento | [unsubscribe/route.test.ts](../src/app/api/unsubscribe/route.test.ts) |
| 1002 | Recompensa de referidos imposible de obtener (claim exige CRON_API_KEY) | [referral/route.ts:123-134](../src/app/api/referral/route.ts) |
| 1003 | Social pack: generador sin importadores, endpoint sin UI | [socialPackGenerator.ts:57-70](../src/lib/viral/socialPackGenerator.ts) |
| 1004 | 7 endpoints públicos sin ningún consumidor (incl. /api/leads: la captura real va por /api/sessions) | [wizard/page.tsx:541](../src/app/wizard/page.tsx) |
| 1009 | Cookie 5 días + ITP de iOS: el email de nurture D7 aterriza en muro de privacidad | [auth/session/route.ts:28-29](../src/app/api/auth/session/route.ts) |
| 1010 | /auth promete "dashboard privado" pero el login crea un uid sin sesiones | [auth/page.tsx:58-77](../src/app/auth/page.tsx) |
| 1013 | Copy "$X / mes" + "Renovable." sin recurrencia implementada | [mercadoPago.ts:60-66](../src/lib/mercadoPago.ts) |
| 1014 | Promesas de fulfillment (email 5-10 min, coach 24h) sin automatización | [checkout/success/page.tsx:46-61](../src/app/checkout/success/page.tsx) |
| 74 | La pantalla de espera afirma "tu enlace se envió a tu correo" aunque el envío puede omitirse en silencio (RESEND_FROM_EMAIL ausente en la config local verificada) | [LoadingExperience.tsx:418-420](../src/app/loading/[shareId]/LoadingExperience.tsx) |

</details>

## BAJOS 🟢 (25)

<details><summary><b>Ver los 25</b></summary>

| # | Hallazgo | Evidencia |
|---|---|---|
| 20 | Aviso de privacidad con placeholders "NECESITA_DATO_DEL_OWNER" — **recalibrado de CRÍTICO a BAJO-en-código** porque el guard de build (next.config.ts:7 + legalConfig.ts:50-59) SÍ bloquea el deploy a producción hasta capturar los datos. Sigue siendo **bloqueador de lanzamiento de negocio**: sin razón social/domicilio/email no hay deploy legal posible | [privacy/page.tsx:5-10](../src/app/privacy/page.tsx) |
| 1 | Allowlist de Origin con dominio legacy ngx-transform.vercel.app hardcodeado (mitigado por cookie SameSite=Lax) | [proxy.ts:137-142](../src/proxy.ts) |
| 3 | Secreto HMAC de bajas cae en fallback a CRON_API_KEY (rotar el cron invalida todos los links de baja enviados) | [unsubscribeToken.ts:6-8](../src/lib/unsubscribeToken.ts) |
| 5 | X-XSS-Protection obsoleto en "1; mode=block" (habilita XS-Leaks en navegadores legacy) | [proxy.ts:110](../src/proxy.ts) |
| 6 | getClientIP confía incondicionalmente en x-vercel-forwarded-for: seguridad atada a Vercel (output standalone permite otros hosts) | [rateLimit.ts:367-370](../src/lib/rateLimit.ts) |
| 7 | Escasez y prueba social fabricadas: cupos "18/20" de env vars y contadores sembrados con +8,547 presentados como reales (riesgo PROFECO/reputación si se hace público) | [.env.example:74-75,155-156](../.env.example), [counter/route.ts:39-40](../src/app/api/counter/route.ts) |
| 8 | console.error en /api/leads puede volcar el email del lead a logs | [leads/route.ts:30,45](../src/app/api/leads/route.ts) |
| 19 | Branding viejo quemado: watermark "NGX TRANSFORM" en cada imagen generada y módulos internos (BLAZE/SAGE) en el PDF | [generate-images/route.ts:104](../src/app/api/generate-images/route.ts) |
| 39 | Código muerto en lib (compressImageServerSide y otros exports sin consumidores) y listas duplicadas a mano | [nanobanana.ts:363](../src/lib/nanobanana.ts) |
| 40 | ENFORCE_RATE_LIMITS_ON_LOCALHOST + detección de localhost: una env var mal puesta apaga TODO el rate limiting | [rateLimit.ts:199-201](../src/lib/rateLimit.ts) |
| 41 | Social pack devuelve la misma imagen para story/post/square (no recorta) | [social-pack/route.ts:115-125](../src/app/api/social-pack/[shareId]/route.ts) |
| 43 | /api/generate-plan sin auth ni ownership (PDF con datos limitados por shareScope; recalibrado a BAJO) | [generate-plan/route.ts:53-54](../src/app/api/generate-plan/route.ts) |
| 45 | AI_WORKER_TOKEN bypassa auth en analyze/generate-images (mitigado: header-only, secureCompare, sin valor en env local) | [analyze/route.ts:90-97](../src/app/api/analyze/route.ts) |
| 46 | Delete token legacy comparado sin timing-safe | [jobManager.ts:335](../src/lib/jobManager.ts) |
| 49 | CSP con 'unsafe-inline' en script-src (doc afirma nonces; Report-Only en paralelo sí los prueba) | [proxy.ts:15-21](../src/proxy.ts) |
| 50 | notes de usuario sin límite de tamaño hacia prompts de Gemini (output validado por zod → impacto acotado) | [validators.ts:43](../src/lib/validators.ts) |
| 52 | Firma del webhook MP comparada con === en vez de secureCompare (convención rota; impráctico de explotar) | [checkout/webhook/route.ts:99](../src/app/api/checkout/webhook/route.ts) |
| 60 | Webhook sin rate limit propio (amplificación de lecturas a MP API, requiere firma válida) | [checkout/webhook/route.ts](../src/app/api/checkout/webhook/route.ts) |
| 61 | UI siempre muestra "MXN" aunque la moneda configurada sea otra | [HybridOfferV2.tsx:71-78](../src/components/results/HybridOfferV2.tsx) |
| 70 | Hydration mismatch: Notification.permission leído en useState durante SSR | [LoadingExperience.tsx:49-54](../src/app/loading/[shareId]/LoadingExperience.tsx) |
| 75 | CTA "Empezar mi temporada" abre pestaña en blanco sin URL de agenda configurada | [AgentBridgeCTA.tsx:59-62](../src/components/AgentBridgeCTA.tsx) |
| 96 | recharts en dependencies sin un solo import | [package.json:47](../package.json) |
| 97 | playwright instalado sin specs ni config | [package.json:62](../package.json) |
| 98 | sharp duplicado en 2 versiones (0.33.x del código vs 0.34.x de Next) | [package.json:49](../package.json) |
| 108 | gemini.test.ts prueba una copia re-implementada de cleanJsonResponse | [gemini.test.ts:10-19](../src/lib/gemini.test.ts) |

</details>

---

## Transparencia del proceso

- **Refutado (1):** "El watermark solo se aplica en el navegador" — FALSO: `applyWatermark()` con Sharp incrusta la marca server-side en cada imagen m4/m8/m12 antes de subirla ([generate-images/route.ts:88-123,425-434](../src/app/api/generate-images/route.ts)). Eliminado del reporte; queda como BAJO #19 solo el texto desactualizado "NGX TRANSFORM".
- **Recalibrados (16):** los verificadores ajustaron severidades en ambas direcciones; los más relevantes: #20 (privacy placeholders) CRÍTICO→BAJO por el guard de build que impide el deploy, #92 (Next CVEs) CRÍTICO→ALTO por mitigaciones parciales del proxy, #42 (shareId 48 bits) ALTO→MEDIO por diseño de producto compartible, #65 (error.tsx) ALTO→MEDIO.
- **Duplicados fusionados (10):** entre auditores que llegaron al mismo problema por rutas distintas (señal de robustez del hallazgo).
- **[NO VERIFICABLE] desde el repo:** configuración real de env vars en Vercel producción (DSN de Sentry, FF_NB_PRO, RESEND_FROM_EMAIL, MP_*, datos legales), existencia de un scheduler externo (n8n/Vercel dashboard) para crons y secuencia de emails, y plan contratado de Upstash. Cada hallazgo afectado lo indica; **verificar estas 3 cosas en el dashboard de Vercel/n8n es la primera tarea del plan de remediación.**
