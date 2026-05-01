# N8N Webhooks — NGX Transform Funnel

## Webhooks Requeridos

### 1. Lead Capturado
- Trigger: `POST /api/sessions` (sesión creada con email)
- Evento N8N: `lead_captured`
- Payload: `{ email, shareId, source, timestamp }`
- Acción N8N: Crear contacto en CRM + tag por fuente + iniciar secuencia de email

### 2. Transform Completado
- Trigger: sesión `status = "ready"` en `/api/generate-images`
- Evento N8N: `transform_completed`
- Payload: `{ email, shareId, status, timestamp }`
- Acción N8N: Update CRM + trigger de retargeting

### 3. CTA Click (Calendly)
- Trigger: click en CTA de oferta HYBRID
- Evento N8N: `hybrid_offer_calendly_click`
- Payload: `{ email, shareId, source, timestamp }`
- Acción N8N: Notificar coach + preparación pre-llamada

### 4. CTA Click (WhatsApp)
- Trigger: click en CTA de WhatsApp
- Evento N8N: `hybrid_offer_whatsapp_click`
- Payload: `{ email, shareId, source, timestamp }`
- Acción N8N: Activar agente WhatsApp + log de interacción

### 5. CTA Click (Chat)
- Trigger: click en CTA de chat GENESIS
- Evento N8N: `hybrid_offer_chat_click`
- Payload: `{ email, shareId, source, timestamp }`
- Acción N8N: Log + scoring comercial

### 6. Conversión (HYBRID comprado)
- Trigger: webhook de pago o actualización manual
- Evento recomendado N8N: `hybrid_converted`
- Payload: `{ email, plan, amount, timestamp }`
- Acción N8N: Welcome flow + onboarding + supresión de emails de venta

### 7. No-show / Abandono
- Trigger: 72h sin actividad post-transform
- Evento recomendado N8N: `lead_inactive_72h`
- Payload: `{ email, shareId, lastActivity, timestamp }`
- Acción N8N: Retargeting + email rescue

## Implementación
- Los webhooks se envían desde backend Next.js con `sendN8NWebhook(event, payload)`.
- Utility: `src/lib/n8nWebhook.ts`.
- URL base: `process.env.N8N_WEBHOOK_BASE_URL`.
- Compatibilidad legacy: `N8N_WEBHOOK_URL` como fallback.
- Los webhooks son fire-and-forget: errores no bloquean la respuesta principal.
