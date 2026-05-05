"use client";

interface WizardConsentPanelProps {
  consentTerms: boolean;
  consentAI: boolean;
  consentEmail: boolean;
  onChangeTerms: (value: boolean) => void;
  onChangeAI: (value: boolean) => void;
  onChangeEmail: (value: boolean) => void;
}

/**
 * Consent block shown below the upload preview when an image is detected.
 * Uses NEOGEN-X glass styling for consistency with the rest of the wizard.
 */
export function WizardConsentPanel({
  consentTerms,
  consentAI,
  consentEmail,
  onChangeTerms,
  onChangeAI,
  onChangeEmail,
}: WizardConsentPanelProps) {
  return (
    <div className="ngx-glass !p-4 md:!p-5 space-y-3">
      <ConsentRow
        required
        checked={consentTerms}
        onChange={onChangeTerms}
        ariaLabel="Aceptar términos y aviso de privacidad"
      >
        Soy mayor de 18 años y acepto los{" "}
        <a
          href="/terms"
          target="_blank"
          rel="noreferrer"
          className="text-[var(--ngx-purple-light)] underline underline-offset-2 hover:text-white"
        >
          Términos de Servicio
        </a>{" "}
        y el{" "}
        <a
          href="/privacy"
          target="_blank"
          rel="noreferrer"
          className="text-[var(--ngx-purple-light)] underline underline-offset-2 hover:text-white"
        >
          Aviso de Privacidad
        </a>
        .
      </ConsentRow>

      <ConsentRow
        required
        checked={consentAI}
        onChange={onChangeAI}
        ariaLabel="Autorizar procesamiento con IA"
      >
        Autorizo que mi foto sea procesada con IA para generar mi visualización aspiracional y mi lectura inicial. Entiendo que no es una predicción garantizada ni una evaluación médica.
      </ConsentRow>

      <div className="border-t border-white/[0.06] pt-3">
        <ConsentRow
          checked={consentEmail}
          onChange={onChangeEmail}
          ariaLabel="Recibir comunicaciones de NGX"
        >
          Acepto recibir mi reporte y comunicaciones educativas de NGX por correo.{" "}
          <span className="text-white/35">(opcional)</span>
        </ConsentRow>
      </div>
    </div>
  );
}

function ConsentRow({
  checked,
  onChange,
  required = false,
  ariaLabel,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  required?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        aria-label={ariaLabel}
        aria-required={required}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-[var(--ngx-purple)]"
      />
      <span className="text-xs leading-relaxed text-white/60 transition-colors group-hover:text-white/85">
        {children}
      </span>
    </label>
  );
}
