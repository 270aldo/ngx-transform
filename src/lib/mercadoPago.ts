/**
 * Mercado Pago — Config y helpers para Checkout Pro
 *
 * Genera preferences (servidor) y normaliza SKUs de NGX HYBRID.
 * Las credenciales se leen de env vars al usarse — nunca a top-level —
 * para que builds sin MP configurado no fallen.
 *
 * Docs: https://www.mercadopago.com.mx/developers/es/docs/checkout-pro/landing
 */

export type HybridSku = "monthly" | "quarterly" | "annual";

export interface HybridSkuConfig {
  sku: HybridSku;
  /** ID interno para tracking y BD (env: HYBRID_SKU_*). */
  internalId: string;
  /** Precio en MXN. 0 si no está configurado. */
  price: number;
  /** Moneda. Default MXN. */
  currency: string;
  /** Label corto para UI ("12 semanas (cohorte completa)"). */
  label: string;
  /** Descripción del item enviada a MP. */
  description: string;
}

export interface CreatePreferenceInput {
  sku: HybridSku;
  shareId: string;
  email?: string;
  baseUrl: string;
}

export interface CreatePreferenceOutput {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
}

const DEFAULT_LABELS: Record<HybridSku, string> = {
  monthly: "Acceso mensual",
  quarterly: "12 semanas (cohorte completa)",
  annual: "Programa anual",
};

const DEFAULT_DESCRIPTIONS: Record<HybridSku, string> = {
  monthly:
    "NGX HYBRID — Acceso mensual al sistema GENESIS + coach humano. Renovable.",
  quarterly:
    "NGX HYBRID — Cohorte de 12 semanas con sistema GENESIS, coach humano y checkpoints semanales.",
  annual:
    "NGX HYBRID — Programa anual completo con sistema GENESIS, coach humano y seguimiento de adherencia continuo.",
};

/**
 * Lee la config de un SKU desde env vars.
 * Devuelve `null` si el precio no está configurado (evita cobrar $0).
 */
export function getHybridSkuConfig(sku: HybridSku): HybridSkuConfig | null {
  const priceMap: Record<HybridSku, string | undefined> = {
    monthly: process.env.NEXT_PUBLIC_HYBRID_PRICE_MONTHLY,
    quarterly: process.env.NEXT_PUBLIC_HYBRID_PRICE_QUARTERLY,
    annual: process.env.NEXT_PUBLIC_HYBRID_PRICE_ANNUAL,
  };

  const idMap: Record<HybridSku, string | undefined> = {
    monthly: process.env.HYBRID_SKU_MONTHLY,
    quarterly: process.env.HYBRID_SKU_QUARTERLY,
    annual: process.env.HYBRID_SKU_ANNUAL,
  };

  const labelMap: Record<HybridSku, string | undefined> = {
    monthly: process.env.NEXT_PUBLIC_HYBRID_LABEL_MONTHLY,
    quarterly: process.env.NEXT_PUBLIC_HYBRID_LABEL_QUARTERLY,
    annual: process.env.NEXT_PUBLIC_HYBRID_LABEL_ANNUAL,
  };

  const priceRaw = priceMap[sku];
  if (!priceRaw) return null;

  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price <= 0) return null;

  return {
    sku,
    internalId: idMap[sku] || `hybrid_${sku}_v1`,
    price,
    currency: process.env.NEXT_PUBLIC_HYBRID_CURRENCY || "MXN",
    label: labelMap[sku] || DEFAULT_LABELS[sku],
    description: DEFAULT_DESCRIPTIONS[sku],
  };
}

/**
 * Lista todas las SKUs configuradas (con precio válido).
 * Útil para el componente HybridOfferV2.
 */
export function listConfiguredSkus(): HybridSkuConfig[] {
  const all: HybridSku[] = ["monthly", "quarterly", "annual"];
  return all
    .map((s) => getHybridSkuConfig(s))
    .filter((c): c is HybridSkuConfig => c !== null);
}

/**
 * Crea una preference de Mercado Pago Checkout Pro.
 * Server-side only — usa MP_ACCESS_TOKEN.
 */
export async function createMpPreference(
  input: CreatePreferenceInput
): Promise<CreatePreferenceOutput> {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "MP_ACCESS_TOKEN no está configurado. Agrega tus credenciales en .env."
    );
  }

  const config = getHybridSkuConfig(input.sku);
  if (!config) {
    throw new Error(
      `SKU "${input.sku}" no tiene pricing configurado. Define NEXT_PUBLIC_HYBRID_PRICE_${input.sku.toUpperCase()}.`
    );
  }

  const payload = {
    items: [
      {
        id: config.internalId,
        title: `NGX HYBRID · ${config.label}`,
        description: config.description,
        category_id: "services",
        quantity: 1,
        currency_id: config.currency,
        unit_price: config.price,
      },
    ],
    payer: input.email
      ? {
          email: input.email,
        }
      : undefined,
    back_urls: {
      success: `${input.baseUrl}/checkout/success?shareId=${encodeURIComponent(input.shareId)}&sku=${input.sku}`,
      pending: `${input.baseUrl}/checkout/pending?shareId=${encodeURIComponent(input.shareId)}&sku=${input.sku}`,
      failure: `${input.baseUrl}/checkout/failure?shareId=${encodeURIComponent(input.shareId)}&sku=${input.sku}`,
    },
    auto_return: "approved",
    statement_descriptor: "NGX HYBRID",
    external_reference: `${input.shareId}__${config.internalId}`,
    notification_url: `${input.baseUrl}/api/checkout/webhook`,
    metadata: {
      shareId: input.shareId,
      sku: input.sku,
      internalId: config.internalId,
      source: "ngx_transform_v12",
    },
  };

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      // Idempotency-Key recomendado por MP para evitar duplicados de preference
      "X-Idempotency-Key": `${input.shareId}-${input.sku}-${Date.now()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Mercado Pago createPreference failed (${res.status}): ${text || res.statusText}`
    );
  }

  const data = (await res.json()) as {
    id: string;
    init_point: string;
    sandbox_init_point: string;
  };

  return {
    preferenceId: data.id,
    initPoint: data.init_point,
    sandboxInitPoint: data.sandbox_init_point,
  };
}

/**
 * Verifica un payment notification de Mercado Pago consultando el estado real.
 * Devuelve el detalle del pago o null si no se pudo verificar.
 */
export interface MpPaymentDetails {
  id: string;
  status: string;
  status_detail?: string;
  external_reference?: string;
  metadata?: Record<string, unknown>;
  transaction_amount?: number;
  payer?: { email?: string };
  date_approved?: string;
}

export async function fetchMpPayment(
  paymentId: string
): Promise<MpPaymentDetails | null> {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) return null;

  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error(
      `[MP] fetchPayment ${paymentId} failed: ${res.status} ${res.statusText}`
    );
    return null;
  }

  return (await res.json()) as MpPaymentDetails;
}

/**
 * Parsea external_reference "shareId__internalId" → componentes.
 */
export function parseExternalReference(
  ref?: string
): { shareId: string; internalId: string } | null {
  if (!ref) return null;
  const idx = ref.indexOf("__");
  if (idx <= 0) return null;
  return {
    shareId: ref.slice(0, idx),
    internalId: ref.slice(idx + 2),
  };
}
