# NGX Transform — Diagnóstico visual de salud muscular

Lead magnet Next.js con Tailwind v4, shadcn/ui v4, Firebase y Gemini (texto + imagen), orientado a entregar un diagnóstico visual de salud muscular y dirección de 12 semanas hacia NGX HYBRID.

## Resumen técnico
- Framework: Next.js 16.2.4 (App Router), React 19, TypeScript 5
- Estilos: Tailwind CSS v4 (tokens/vars), shadcn/ui v4 (Radix)
- IA:
  - Gemini (texto): `@google/generative-ai` con validación zod estricto
  - Gemini (imagen): alias “NanoBanana” en `lib/nanobanana.ts`
- Datos: Firebase Admin (Firestore + Storage) en server; Firebase client (auth anónima, storage) en wizard
- Emails: Resend + @react-email/components

## Scripts
- `pnpm dev`: dev server
- `pnpm build`: build prod
- `pnpm start`: server prod
- `pnpm lint`: lint con eslint-config-next
- `pnpm test`: suite Vitest

## Variables de entorno (`.env.local`)
- Cliente Firebase (NEXT_PUBLIC_*): API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID
- Admin Firebase: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
- Gemini: GEMINI_API_KEY, GEMINI_IMAGE_MODEL (opcional)
- OpenAI Realtime: OPENAI_API_KEY, OPENAI_REALTIME_MODEL=gpt-realtime (agente conversacional HYBRID)
- App: NEXT_PUBLIC_APP_URL (canónica), NEXT_PUBLIC_BASE_URL (fallback legacy), NEXT_PUBLIC_BOOKING_URL (opcional), NEXT_PUBLIC_DEMO_MODE
- Funnel HYBRID: NEXT_PUBLIC_CALENDLY_URL, NEXT_PUBLIC_WHATSAPP_NUMBER, NEXT_PUBLIC_FF_HYBRID_DIRECT_CHECKOUT=false, NEXT_PUBLIC_FF_HYBRID_VOICE_AGENT=false por defecto

Consejos:
- Demo: `NEXT_PUBLIC_DEMO_MODE=1` (sin llamadas reales; flujo simulado para demos)
- Storage bucket: usa el mostrado en Firebase Storage (p.ej. `<project-id>.appspot.com`)

## Arquitectura
- App Router (`src/app`):
  - `/wizard`: flujo de generación (lead → upload → session → analyze → images)
  - `/loading/[shareId]`: progreso de análisis/generación con retry
  - `/s/[shareId]`: visualización + insight muscular + roadmap + diagnóstico HYBRID
  - `/s/[shareId]?demo=1`: preview de resultados con datos mock en desarrollo

- Librerías clave (`src/lib`):
  - `firebaseAdmin.ts`, `storage.ts`: Admin SDK (signed URLs, uploads)
  - `firebaseClient.ts`: client SDK (auth + storage)
  - `gemini.ts`: prompt/parse estricto JSON para análisis
  - `nanobanana.ts`: imagen Gemini (image-to-image)
  - `validators.ts`: zod schemas de entrada
  - `/api/realtime/session`: emite client secrets efímeros para OpenAI Realtime/WebRTC, sin exponer OPENAI_API_KEY al navegador

- UI:
  - `src/components/shadcn/ui/*`: base shadcn (button/input/textarea/card/progress/separator/tabs/select/tooltip/dialog)
  - `src/components/landing/*`: landing por variantes (`/`, `/j`, `/m`)
  - `src/components/results/*`: visualización, Muscle Health Score, resumen, roadmap y oferta HYBRID
  - `src/components/wizard/*`: wizard privado por etapas

## Estilo NGX (dark cinematic)
- Tipografía: United Sans Cond (display), Inter (body/UI), JetBrains Mono (métricas/labels)
- Colores tokens (globals.css):
  - `--primary: #6D00FF` (Electric Violet)
  - `--accent: #5B21B6` (Deep Purple)
  - Superficies/border/ring definidos en :root y mapeados a @theme inline
- Componentes pills (rounded-full), focus ring violeta, Cards rounded-2xl

## Branding / Logos
- Path oficial esperado:
  - `public/images/brand/logo.svg`
  - `public/images/brand/logo-mark.svg`
- Mientras no se carguen assets oficiales, `src/components/ui/Logo.tsx` usa fallback tipográfico.

## Flujo de datos (resumen)
1) Wizard: sube foto (storage) + crea sesión (Firestore)
2) Analyze: Gemini texto (JSON validado) → guarda en Firestore
3) Generate Images: Gemini imagen (image-to-image) → storage generado (m4/m8/m12)
4) Resultados: signed URLs, overlay, insights/timeline/acciones

## Buenas prácticas y organización
- Commit semántico (conventional commits):
  - `feat(ui): ...`, `chore(docs): ...`, `fix(results): ...`
- Lint/format antes de commit (opcional añadir pre-commit hook)
- Archivos grandes y secretos: nunca en repo (usa .env.local y .gitignore)

## Desarrollo local
1) Configura `.env.local` en la raíz con tus claves
2) Instala deps: `pnpm install`
3) Dev: `pnpm dev` → http://localhost:3000
4) Demo results: `/s/demo?demo=1` (sin Firestore)
5) Flujo real: `/wizard` → `/loading/[id]` → `/s/[id]`

## Producción
- Checklist: `docs/RELEASE_CHECKLIST.md`
- Auditoría final legal/comercial/config: `docs/PRODUCTION_LAUNCH_AUDIT_2026-05-25.md`
- Índices Firebase: `docs/FIRESTORE_INDEXES.md`

## Roadmap inmediato
- Fase 2: sincronizar tabs Visor/Timeline + deep-link (#m4)
- Pulidos: animaciones sutiles (framer-motion), gaps/paddings uniformes
- QA de accesibilidad (roles, aria, focus-visible)
