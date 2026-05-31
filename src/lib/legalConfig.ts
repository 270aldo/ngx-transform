/**
 * Legal configuration guard.
 *
 * The privacy notice (LFPDPPP) and terms pages render the responsible party's
 * legal name, address and contact email from public env vars. If those are
 * empty they fall back to the literal placeholder "NECESITA_DATO_DEL_OWNER",
 * which would publish an INVALID privacy notice for biometric/body data.
 *
 * This module centralizes the values and provides a build-time assertion that
 * fails a *real production deployment* (Vercel `VERCEL_ENV=production`) when the
 * legal data is missing. Local dev and CI builds (which use placeholders) are
 * intentionally NOT blocked.
 */

export const LEGAL_PLACEHOLDER = "NECESITA_DATO_DEL_OWNER";

export interface LegalConfig {
  responsibleName: string;
  responsibleAddress: string;
  supportEmail: string;
}

function clean(value: string | undefined): string {
  return (value ?? "").trim();
}

export function getLegalConfig(): LegalConfig {
  return {
    responsibleName: clean(process.env.NEXT_PUBLIC_LEGAL_RESPONSIBLE_NAME),
    responsibleAddress: clean(process.env.NEXT_PUBLIC_LEGAL_RESPONSIBLE_ADDRESS),
    supportEmail: clean(process.env.NEXT_PUBLIC_SUPPORT_EMAIL),
  };
}

/** Returns the list of legal fields that are empty or still a placeholder. */
export function getMissingLegalFields(): string[] {
  const cfg = getLegalConfig();
  const missing: string[] = [];
  const isUnset = (v: string) => v === "" || v === LEGAL_PLACEHOLDER;
  if (isUnset(cfg.responsibleName)) missing.push("NEXT_PUBLIC_LEGAL_RESPONSIBLE_NAME");
  if (isUnset(cfg.responsibleAddress)) missing.push("NEXT_PUBLIC_LEGAL_RESPONSIBLE_ADDRESS");
  if (isUnset(cfg.supportEmail)) missing.push("NEXT_PUBLIC_SUPPORT_EMAIL");
  return missing;
}

/**
 * Throw during a real production deployment if legal data is missing.
 * No-op on local dev and CI (VERCEL_ENV !== "production").
 */
export function assertLegalConfigForProductionDeploy(): void {
  if (process.env.VERCEL_ENV !== "production") return;
  const missing = getMissingLegalFields();
  if (missing.length > 0) {
    throw new Error(
      `[legalConfig] Cannot deploy to production: missing legal env vars -> ${missing.join(
        ", "
      )}. The privacy/terms pages would render "${LEGAL_PLACEHOLDER}". Set these in the Vercel production environment.`
    );
  }
}
