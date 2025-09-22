# NGX Transform — Visual fitness premium

Aplicación Next.js con Tailwind v4, shadcn/ui v4, Firebase y Gemini (texto + imagen), orientada a generar análisis visual realista 0/4/8/12 meses.

## Resumen técnico
- Framework: Next.js 15 (App Router), React 19, TypeScript 5
- Estilos: Tailwind CSS v4 (tokens/vars), shadcn/ui v4 (Radix)
- IA:
  - Gemini (texto): `@google/generative-ai` con validación zod estricto
  - Gemini (imagen): alias “NanoBanana” en `lib/nanobanana.ts`
- Datos: Firebase Admin (Firestore + Storage) en server; Firebase client (auth anónima, storage) en wizard
- Emails: Resend + @react-email/components

## Scripts
- `npm run dev`: dev server
- `npm run build`: build prod
- `npm start`: server prod
- `npm run lint`: lint con eslint-config-next

## Variables de entorno (app/.env.local)
- Cliente Firebase (NEXT_PUBLIC_*): API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID
- Admin Firebase: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
- Gemini: GEMINI_API_KEY, GEMINI_IMAGE_MODEL (opcional)
- App: NEXT_PUBLIC_BASE_URL, NEXT_PUBLIC_BOOKING_URL (opcional), NEXT_PUBLIC_DEMO_MODE

Consejos:
- Demo: `NEXT_PUBLIC_DEMO_MODE=1` (sin llamadas reales; flujo simulado para demos)
- Storage bucket: usa el mostrado en Firebase Storage (p.ej. `<project-id>.appspot.com`)

## Arquitectura
- App Router (`src/app`):
  - `/wizard`: flujo de generación (lead → upload → session → analyze → images)
  - `/s/[shareId]`: resultados reales (sticky 3 columnas)
  - `/demo/result`: preview con datos mock para validar UI

- Librerías clave (`src/lib`):
  - `firebaseAdmin.ts`, `storage.ts`: Admin SDK (signed URLs, uploads)
  - `firebaseClient.ts`: client SDK (auth + storage)
  - `gemini.ts`: prompt/parse estricto JSON para análisis
  - `nanobanana.ts`: imagen Gemini (image-to-image)
  - `validators.ts`: zod schemas de entrada

- UI:
  - `src/components/shadcn/ui/*`: base shadcn (button/input/textarea/card/progress/separator/tabs/select/tooltip/dialog)
  - `src/components/results/*`: layout modular de Resultados (ImageViewer, InsightsCard, ActionsCard, ProfileSummaryCard)
  - `src/components/TimelineViewer.tsx`: tabs 0/4/8/12 con overlay/minimap

## Estilo NGX (dark premium)
- Tipografía: Inter (texto y títulos: minimal tech)
- Colores tokens (globals.css):
  - `--primary: #6D00FF` (Electric Violet)
  - `--accent: #5B21B6` (Deep Purple)
  - Superficies/border/ring definidos en :root y mapeados a @theme inline
- Componentes pills (rounded-full), focus ring violeta, Cards rounded-2xl

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
1) Configura `.env.local` en `app/` con tus claves
2) Instala deps: `npm install`
3) Dev: `npm run dev` → http://localhost:3000
4) Demo UI: `/demo/result` (sin backends)
5) Flujo real: `/wizard` → `/s/[id]`

## Roadmap inmediato
- Fase 2: sincronizar tabs Visor/Timeline + deep-link (#m4)
- Pulidos: animaciones sutiles (framer-motion), gaps/paddings uniformes
- QA de accesibilidad (roles, aria, focus-visible)
