"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ensureAnonymousSession, getClientStorage } from "@/lib/firebaseClient";
import { ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input"; // Kept for text fields
import { useToast } from "@/components/ui/toast-provider";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { Eye, Target, Activity, Cpu, ChevronRight, ChevronLeft, Lock, ArrowRight } from "lucide-react";
import { getStoredVariant } from "@/hooks/useVariantTracking";

// New Components
import { EliteOptionCard } from "@/components/EliteOptionCard";
import { CyberSlider } from "@/components/CyberSlider";
import {
  WizardCommandBar,
  WizardPhotoStep,
  type WizardStageTab,
} from "@/components/wizard";

const OptionalEmailSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().email("Ingresa un correo valido").optional());

const FormSchema = z.object({
  email: OptionalEmailSchema,
  // Stage 2: Biometrics
  age: z.coerce.number().int().min(18).max(100),
  sex: z.enum(["male", "female", "other"]),
  heightCm: z.coerce.number().min(100).max(250),
  weightKg: z.coerce.number().min(30).max(300),
  bodyType: z.enum(["ectomorph", "mesomorph", "endomorph"]).default("mesomorph"),
  bodyFatLevel: z.enum(["bajo", "medio", "alto"]).default("medio"),

  // Stage 3: Strategy
  level: z.enum(["novato", "intermedio", "avanzado"]),
  goal: z.enum(["definicion", "masa", "mixto"]),
  focusZone: z.enum(["upper", "lower", "abs", "full"]).default("full"),
  weeklyTime: z.coerce.number().min(1).max(14),

  // Stage 4: Mental
  disciplineRating: z.coerce.number().min(1).max(10).default(5),
  stressLevel: z.coerce.number().min(1).max(10).default(5),
  sleepQuality: z.coerce.number().min(1).max(10).default(5),

  // Extras (Hidden/Defaults)
  trainingDaysPerWeek: z.coerce.number().min(1).max(7).default(3),
  trainingHistoryYears: z.coerce.number().min(0).max(30).default(0),
  nutritionQuality: z.coerce.number().min(1).max(10).default(6),
  trainingStyle: z.enum(["fuerza", "hipertrofia", "funcional", "hiit", "mixto"]).default("mixto"),
  aestheticPreference: z.enum(["cinematic", "editorial", "street", "minimal"]).default("cinematic"),
  specificGoals: z.array(z.string()).default([]),
  focusAreas: z.array(z.string()).default([]),
  notes: z.string().optional(),
  photo: z.custom<FileList>().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

const STAGE_LABELS: Record<number, { title: string; subtitle: string }> = {
  1: {
    title: "Foto base",
    subtitle: "Sube una imagen real y acepta el consentimiento privado",
  },
  2: {
    title: "Perfil corporal",
    subtitle: "Edad, medidas y parámetros físicos iniciales",
  },
  3: {
    title: "Objetivo y contexto",
    subtitle: "Define qué quieres lograr y qué puede frenarte",
  },
  4: {
    title: "Cierre privado",
    subtitle: "Confirma correo y genera tu visualización",
  },
};

const WIZARD_STAGE_TABS: readonly WizardStageTab[] = [
  { id: 1, short: "Foto" },
  { id: 2, short: "Perfil" },
  { id: 3, short: "Objetivo" },
  { id: 4, short: "Cierre" },
] as const;

const TOTAL_STEPS = WIZARD_STAGE_TABS.length;

// File validation constants for the photo upload step
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_PHOTO_SIZE_MB = 8;
const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;

/**
 * Lightweight client-side wizard tracking — dispatches CustomEvents on window
 * so any future analytics integration can listen without us adding a dependency.
 */
function trackWizardEvent(name: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent(`wizard:${name}`, { detail: payload })
    );
  } catch {
    // no-op — never block UX on tracking
  }
}

export const dynamic = "force-dynamic";

function LoadingMessages({ stage }: { stage: string }) {
  const [msgIndex, setMsgIndex] = useState(0);

  const analyzeMessages = [
    "VALIDANDO TU IMAGEN...",
    "PREPARANDO TU SESIÓN PRIVADA...",
    "CONSTRUYENDO TU VISUALIZACIÓN...",
    "ORDENANDO EL SIGUIENTE PASO...",
    "DEJANDO LISTO TU PANEL PRIVADO..."
  ];

  useEffect(() => {
    if (stage !== 'analyze') return;
    const len = analyzeMessages.length;
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % len);
    }, 2000);
    return () => clearInterval(interval);
  }, [stage, analyzeMessages.length]);

  let text = "";
  if (stage === 'upload') text = "SUBIENDO TU FOTO...";
  else if (stage === 'render') text = "INICIANDO TU VISUALIZACIÓN...";
  else if (stage === 'done') text = "LISTO.";
  else text = analyzeMessages[msgIndex];

  return (
    <h2 key={text} className="landing-heading text-[2rem] md:text-[2.4rem] leading-[0.94] mb-2 min-h-[2rem] animate-in fade-in slide-in-from-bottom-2 duration-300">
      {text}
    </h2>
  );
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

async function readErrorMessage(response: Response, fallback: string) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const data = await response.json();
      if (typeof data?.error === "string") return data.error;
      return fallback;
    } catch {
      return fallback;
    }
  }

  try {
    const text = (await response.text()).trim();
    return text || fallback;
  } catch {
    return fallback;
  }
}

export default function WizardPage() {
  const router = useRouter();
  const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "1";
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [accessReady, setAccessReady] = useState(DEMO);
  const [accessError, setAccessError] = useState<string | null>(null);
  const { addToast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Processing States
  const [processStage, setProcessStage] = useState<"idle" | "upload" | "analyze" | "render" | "done">("idle");
  const [processProgress, setProcessProgress] = useState(0);

  // Consent States
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentAI, setConsentAI] = useState(false);
  const [consentEmail, setConsentEmail] = useState(false);
  const requiredConsentsAccepted = consentTerms && consentAI;
  const stageMeta = STAGE_LABELS[currentStage] ?? STAGE_LABELS[1];

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema) as Resolver<FormValues>,
    defaultValues: {
      email: "",
      sex: "male",
      level: "novato",
      goal: "definicion",
      weeklyTime: 5,
      bodyType: "mesomorph",
      bodyFatLevel: "medio",
      aestheticPreference: "cinematic",
      disciplineRating: 7,
      stressLevel: 5,
      sleepQuality: 7,
      age: 25,
      heightCm: 175,
      weightKg: 75,
    },
  });

  const photoFile = watch("photo");
  const watchedEmail = watch("email");
  const selectedPhoto = photoFile?.[0] ?? null;
  const resolvedEmail = (watchedEmail || user?.email || "").trim();
  const usingAnonymousAccess = Boolean(user?.isAnonymous);
  const canAdvancePastIdentity = Boolean(previewUrl && requiredConsentsAccepted && accessReady);
  const canSubmitWizard = Boolean(previewUrl && requiredConsentsAccepted && resolvedEmail && accessReady);
  const selectedGoalLabel =
    watch("goal") === "definicion"
      ? "Definición extrema"
      : watch("goal") === "masa"
        ? "Hipertrofia masiva"
        : "Híbrido atlético";
  const selectedFocusLabel =
    watch("focusZone") === "upper"
      ? "Tren superior"
      : watch("focusZone") === "lower"
        ? "Tren inferior"
        : watch("focusZone") === "abs"
          ? "Core & abs"
          : "Full body";

  useEffect(() => {
    if (DEMO) {
      setAccessReady(true);
      setAccessError(null);
      return;
    }

    if (authLoading) return;

    let cancelled = false;

    if (user) {
      setAccessReady(true);
      setAccessError(null);
      return () => {
        cancelled = true;
      };
    }

    setAccessReady(false);
    setAccessError(null);

    void ensureAnonymousSession()
      .then(() => {
        if (cancelled) return;
        setAccessReady(true);
      })
      .catch((error) => {
        if (cancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : "No pudimos preparar tu acceso privado.";
        setAccessError(message);
        setFormError("No pudimos preparar tu acceso privado. Intenta de nuevo o entra con Google.");
      });

    return () => {
      cancelled = true;
    };
  }, [DEMO, authLoading, user]);

  useEffect(() => {
    if (user?.email && watchedEmail !== user.email) {
      setValue("email", user.email, { shouldValidate: true, shouldDirty: false });
    }
  }, [user?.email, watchedEmail, setValue]);

  useEffect(() => {
    setFormError(null);
  }, [currentStage]);

  useEffect(() => {
    if (!selectedPhoto) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedPhoto);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedPhoto]);

  const onFormError = (errs: FieldErrors<FormValues>) => {
    console.log("Validation Errors:", errs);
    const firstError = Object.values(errs)[0];
    const message =
      firstError && typeof firstError === "object" && "message" in firstError
        ? String(firstError.message || "Verifica los datos de calibración")
        : "Verifica los datos de calibración";
    if (firstError) {
      setFormError(message);
      addToast({ variant: "error", message: `Error: ${message}` });
    }
  };

  // --- ACTIONS ---
  const nextStage = () => {
    // Ideally validate current step fields here before moving
    if (currentStage === 1 && !canAdvancePastIdentity) {
      const message = !previewUrl
        ? "Sube una foto para continuar."
        : !accessReady
          ? "Todavía estamos preparando tu acceso privado. Espera unos segundos."
        : "Debes aceptar los consentimientos obligatorios antes de continuar.";
      setFormError(message);
      addToast({ variant: "error", message });
      return;
    }

    if (currentStage < 4) setCurrentStage(c => c + 1);
  };

  const prevStage = () => {
    if (currentStage > 1) setCurrentStage(c => c - 1);
  };

  const goBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    const variant = getStoredVariant();
    if (variant === "jovenes") {
      router.push("/j");
      return;
    }
    if (variant === "mayores") {
      router.push("/m");
      return;
    }

    router.push("/");
  }, [router]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const validatePhotoFile = useCallback(
    (file: File): { ok: true } | { ok: false; message: string } => {
      const acceptedTypes = ACCEPTED_PHOTO_TYPES as readonly string[];
      if (!acceptedTypes.includes(file.type)) {
        return { ok: false, message: "Sube una imagen JPG, PNG o WEBP." };
      }
      if (file.size > MAX_PHOTO_SIZE_BYTES) {
        return {
          ok: false,
          message: `La imagen supera ${MAX_PHOTO_SIZE_MB}MB. Usa una versión más ligera.`,
        };
      }
      return { ok: true };
    },
    []
  );

  const acceptPhotoFile = useCallback(
    (file: File): boolean => {
      const result = validatePhotoFile(file);
      if (!result.ok) {
        addToast({ variant: "error", message: result.message });
        return false;
      }

      const dt = new DataTransfer();
      dt.items.add(file);
      if (inputRef.current) inputRef.current.files = dt.files;
      setValue("photo", dt.files as unknown as FileList);

      const sizeMb = file.size / (1024 * 1024);
      trackWizardEvent("photo_selected", {
        fileType: file.type,
        fileSizeMb: Number(sizeMb.toFixed(2)),
      });
      return true;
    },
    [addToast, setValue, validatePhotoFile]
  );

  const onPhotoInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const accepted = acceptPhotoFile(file);
      if (!accepted) {
        // Wipe rejected file from the input so the same file can be re-picked after fixing it
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [acceptPhotoFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      acceptPhotoFile(file);
    },
    [acceptPhotoFile]
  );

  const onDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  // Step-view + consent tracking (non-blocking)
  useEffect(() => {
    trackWizardEvent("step_view", { step: currentStage });
  }, [currentStage]);

  const handleConsentTermsChange = useCallback((value: boolean) => {
    setConsentTerms(value);
    trackWizardEvent("consent_checked", { consent: "terms", checked: value });
  }, []);
  const handleConsentAIChange = useCallback((value: boolean) => {
    setConsentAI(value);
    trackWizardEvent("consent_checked", { consent: "ai", checked: value });
  }, []);
  const handleConsentEmailChange = useCallback((value: boolean) => {
    setConsentEmail(value);
    trackWizardEvent("consent_checked", { consent: "email", checked: value });
  }, []);

  const handleContinueFromPhoto = useCallback(() => {
    trackWizardEvent("continue_click", {
      step: 1,
      ready: canAdvancePastIdentity,
    });
    nextStage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAdvancePastIdentity]);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const authUser = user ?? (DEMO ? null : await ensureAnonymousSession());
      if (!authUser) throw new Error("No pudimos preparar tu acceso privado");
      const file: File | null = selectedPhoto;
      if (!file) throw new Error("Debes subir una fotografía");
      const submissionEmail = (values.email || authUser.email || "").trim();
      if (!submissionEmail) {
        setCurrentStage(4);
        throw new Error("Confirma el correo donde quieres recibir tu acceso privado antes de ejecutar la visualización.");
      }

      // Staged processing states for the private visualization flow
      setProcessStage("upload"); setProcessProgress(20); await new Promise(r => setTimeout(r, 800));

      const sessionSeed = (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)).replace(/-/g, "").slice(0, 12);
      const ext = file.name.split(".").pop() || "jpg";
      const uid = authUser.uid;
      const storagePath = `uploads/${uid}/${sessionSeed}/original.${ext}`;

      const storageRef = ref(getClientStorage(), storagePath);
      await withTimeout(
        uploadBytes(storageRef, file, { contentType: file.type || "image/jpeg" }),
        45000,
        "La carga de la fotografía tardó demasiado. Intenta de nuevo."
      );

      setProcessStage("analyze"); setProcessProgress(50);

      const profile = { ...values, notes: values.notes || "" };
      const token = DEMO ? null : await authUser.getIdToken();

      // Get landing variant for analytics tracking
      const landingVariant = getStoredVariant();

      const createRes = await withTimeout(
        fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            email: submissionEmail,
            input: profile,
            photoPath: storagePath,
            consents: {
              terms: consentTerms,
              aiProcessing: consentAI,
              marketingEmailOptIn: consentEmail,
              captureSource: "wizard",
            },
            landingVariant,
          }),
        }),
        30000,
        "No pudimos crear tu sesión. Intenta de nuevo."
      );
      if (!createRes.ok) {
        throw new Error(
          await readErrorMessage(createRes, "No pudimos crear tu sesión. Intenta de nuevo.")
        );
      }
      const createJson = await createRes.json();
      const sessionId = createJson.sessionId as string;

      setProcessStage("render"); setProcessProgress(80);
      router.push(`/loading/${sessionId}`);

      void (async () => {
        try {
          const analyzeRes = await withTimeout(
            fetch("/api/analyze", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ sessionId }),
            }),
            45000,
            "El análisis tardó demasiado. Reintenta desde la pantalla de progreso."
          );

          if (!analyzeRes.ok) {
            const message = await readErrorMessage(
              analyzeRes,
              "No pudimos iniciar el análisis inicial."
            );
            console.error("[Wizard] Analyze bootstrap failed:", message);
          }
        } catch (bootstrapError) {
          console.error("[Wizard] Analyze bootstrap error:", bootstrapError);
        }
      })();

      return;

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setFormError(msg);
      addToast({ variant: "error", message: msg });
      setLoading(false);
      setProcessStage("idle");
    }
  };

  // --- RENDER STAGES ---

  return (
    <div className="relative min-h-screen bg-transparent text-white selection:bg-[#6D00FF]/30 font-[var(--font-body)]">

      {/* Unified command bar (back + center title + progress tabs) */}
      <WizardCommandBar
        current={currentStage}
        totalSteps={TOTAL_STEPS}
        title={stageMeta.title}
        subtitle={stageMeta.subtitle}
        tabs={WIZARD_STAGE_TABS}
        onBack={goBack}
        isDemoMode={DEMO}
      />

      {/* MAIN CONTENT AREA */}
      <form onSubmit={handleSubmit(onSubmit, onFormError)} className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-24 pt-32 md:px-6 md:pb-28 md:pt-36">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          {...register("photo", { onChange: onPhotoInputChange })}
          ref={(el) => {
            inputRef.current = el;
            register("photo").ref(el);
          }}
        />

        {formError && !loading ? (
          <div className="mx-auto mb-6 w-full max-w-3xl rounded-[24px] border border-red-500/25 bg-red-500/10 px-4 py-4 text-sm text-red-100 backdrop-blur-sm">
            {formError}
          </div>
        ) : null}

        {loading ? (
          <div className="flex flex-1 items-center justify-center animate-in fade-in zoom-in duration-500">
            <div className="w-full max-w-2xl rounded-[32px] landing-surface-strong px-6 py-10 text-center md:px-10 md:py-12">
              <p className="landing-kicker mb-5">Procesamiento privado en curso</p>
              <div className="relative mx-auto mb-8 h-32 w-32">
                <div className="absolute inset-0 rounded-full border-4 border-[#6D00FF]/20 animate-spin-slow" />
                <div className="absolute inset-2 rounded-full border-4 border-r-[#6D00FF] border-t-[#6D00FF] border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-black italic text-[#6D00FF]">
                  {processProgress}%
                </div>
              </div>

              <LoadingMessages stage={processStage} />
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/60 md:text-base">
                Estamos creando tu sesión privada, ordenando tu contexto y dejando lista la experiencia donde verás la visualización y el siguiente paso.
              </p>

              <div className="mx-auto mt-8 h-2 max-w-md overflow-hidden rounded-full border border-white/8 bg-white/6">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6D00FF] to-[#B98CFF] transition-all duration-500"
                  style={{ width: `${processProgress}%` }}
                />
              </div>

              <div className="mx-auto mt-8 max-w-lg rounded-[24px] landing-surface px-5 py-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#6D00FF] animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C8A5FF]">
                      Sesión segura
                    </p>
                    <p className="text-sm leading-relaxed text-white/75">
                      Mantén esta ventana abierta unos momentos. En cuanto quede listo te llevaremos a la vista donde podrás seguir cada etapa.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-white/30">
                No cierres esta pestaña todavía
              </p>
            </div>
          </div>
        ) : !accessReady ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xl rounded-[32px] landing-surface px-6 py-10 text-center md:px-8 md:py-12">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#6D00FF]/25 bg-[#6D00FF]/10">
                <Lock className="h-6 w-6 text-[#C8A5FF]" />
              </div>
              <p className="landing-kicker mb-4">Acceso privado</p>
              <h2 className="landing-heading text-[2.2rem] leading-[0.94] text-white md:text-[2.8rem]">
                Preparamos tu sesión segura.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/60 md:text-base">
                Estamos creando el acceso temporal para que puedas subir tu foto y generar tu visualización sin meter login antes de tiempo.
              </p>
            {accessError ? (
              <div className="mx-auto mt-6 max-w-md rounded-[22px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {accessError}
              </div>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => router.push("/auth?next=/wizard")}
              >
                Entrar con Google
              </Button>
            </div>
            </div>
          </div>
        ) : (
          <>
            {/* STAGE 1: PHOTO BASE (refactored into wizard components) */}
            {currentStage === 1 && (
              <WizardPhotoStep
                previewUrl={previewUrl}
                consentTerms={consentTerms}
                consentAI={consentAI}
                consentEmail={consentEmail}
                canAdvance={canAdvancePastIdentity}
                onClickPicker={openPicker}
                onDropFile={onDrop}
                onDragOver={onDrag}
                onDragEnter={onDrag}
                onChangeTerms={handleConsentTermsChange}
                onChangeAI={handleConsentAIChange}
                onChangeEmail={handleConsentEmailChange}
                onContinue={handleContinueFromPhoto}
              />
            )}

            {/* STAGE 2: BIOMETRICS */}
            {currentStage === 2 && (
              <div className="w-full max-w-5xl mx-auto animate-in slide-in-from-right-8 fade-in duration-500 space-y-8">
                <div className="text-center">
                  <span className="ngx-eyebrow-pill mb-4 mx-auto">Paso 2 · Perfil corporal</span>
                  <h2 className="ngx-h1 mx-auto !text-center" style={{ maxWidth: "20ch" }}>
                    Le damos contexto a tu punto de partida.
                  </h2>
                  <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
                    Estos datos no sustituyen una medición clínica. Sólo calibran el rango de la visualización para que no se sienta como un juguete genérico.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-start">
                  <div className="ngx-section-panel !p-5 md:!p-6 space-y-5">
                    <CyberSlider
                      label="Edad"
                      {...register("age")}
                      min={18} max={80} step={1}
                      valueDisplay={watch("age")}
                      suffix="AÑOS"
                    />
                    <CyberSlider
                      label="Altura"
                      {...register("heightCm")}
                      min={140} max={220} step={1}
                      valueDisplay={watch("heightCm")}
                      suffix="CM"
                      trackColor="emerald"
                    />
                    <CyberSlider
                      label="Peso"
                      {...register("weightKg")}
                      min={40} max={150} step={0.5}
                      valueDisplay={watch("weightKg")}
                      suffix="KG"
                      trackColor="violet"
                    />

                    <div className="ngx-card !p-4">
                      <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Género biológico</span>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {(["male", "female"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setValue("sex", s)}
                            className={cn(
                              "py-3 rounded-xl border text-[10px] font-mono uppercase tracking-[0.18em] transition-all duration-150",
                              watch("sex") === s
                                ? "bg-[var(--ngx-purple)] text-white border-[var(--ngx-purple)] shadow-[var(--ngx-glow-primary-soft)]"
                                : "bg-white/[0.03] text-white/45 border-white/10 hover:border-white/20 hover:text-white/70"
                            )}
                          >
                            {s === "male" ? "Masculino" : "Femenino"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-white/45 px-1">
                      Mientras más honestos sean estos datos, mejor se sentirá el puente entre la visualización y el roadmap.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="ngx-glass !p-5 md:!p-6">
                      <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Tipo somático</span>
                      <div className="mt-4 grid grid-cols-1 gap-3">
                        <EliteOptionCard
                          title="ECTOMORFO"
                          description="Estructura ligera, metabolismo rápido, dificultad para ganar masa."
                          selected={watch("bodyType") === "ectomorph"}
                          onClick={() => setValue("bodyType", "ectomorph")}
                          idx={1}
                        />
                        <EliteOptionCard
                          title="MESOMORFO"
                          description="Atlético natural, gana músculo y pierde grasa con facilidad."
                          selected={watch("bodyType") === "mesomorph"}
                          onClick={() => setValue("bodyType", "mesomorph")}
                          idx={2}
                        />
                        <EliteOptionCard
                          title="ENDOMORFO"
                          description="Estructura sólida y ancha, gana fuerza fácilmente."
                          selected={watch("bodyType") === "endomorph"}
                          onClick={() => setValue("bodyType", "endomorph")}
                          idx={3}
                        />
                      </div>
                    </div>

                    <div className="ngx-card !p-5">
                      <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Lectura inicial</span>
                      <p className="mt-2 text-base font-bold text-white">Todavía no estamos diagnosticando.</p>
                      <p className="mt-2 text-sm leading-relaxed text-white/55">
                        Sólo estamos construyendo una base más útil para que la visualización y el siguiente paso tengan coherencia entre sí.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 3: MISSION */}
            {currentStage === 3 && (
              <div className="w-full max-w-5xl mx-auto animate-in slide-in-from-right-8 fade-in duration-500 space-y-8">
                <div className="text-center">
                  <span className="ngx-eyebrow-pill mb-4 mx-auto">Paso 3 · Objetivo y contexto</span>
                  <h2 className="ngx-h1 mx-auto !text-center" style={{ maxWidth: "20ch" }}>
                    Define la dirección de tu visualización.
                  </h2>
                  <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
                    Aquí decidimos qué versión de ti estamos intentando visualizar para que el resultado tenga una intención clara, no sólo un efecto bonito.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <EliteOptionCard
                    className="h-64"
                    title="DEFINICIÓN EXTREMA"
                    description="Maximiza la definición muscular y reduce grasa corporal a un dígito."
                    selected={watch("goal") === "definicion"}
                    onClick={() => setValue("goal", "definicion")}
                    idx={1}
                    imageSrc="/images/backgrounds/goal-definicion.svg"
                    imageAlt="Definición extrema"
                    icon={Target}
                    iconLabel="Precisión metabólica"
                    overlayTone="deep"
                  />
                  <EliteOptionCard
                    className="h-64"
                    title="HIPERTROFIA MASIVA"
                    description="Prioriza volumen muscular, densidad y ganancia de tamaño total."
                    selected={watch("goal") === "masa"}
                    onClick={() => setValue("goal", "masa")}
                    idx={2}
                    imageSrc="/images/backgrounds/goal-hipertrofia.svg"
                    imageAlt="Hipertrofia masiva"
                    icon={Activity}
                    iconLabel="Densidad y volumen"
                  />
                  <EliteOptionCard
                    className="h-64"
                    title="HÍBRIDO ATLÉTICO"
                    description="Equilibrio entre rendimiento, estética y funcionalidad en todo el cuerpo."
                    selected={watch("goal") === "mixto"}
                    onClick={() => setValue("goal", "mixto")}
                    idx={3}
                    imageSrc="/images/backgrounds/goal-hibrido.svg"
                    imageAlt="Híbrido atlético"
                    icon={Cpu}
                    iconLabel="Rendimiento total"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="ngx-card !p-6">
                    <span className="ngx-eyebrow !text-[10px] block mb-4" style={{ color: "var(--ngx-fg-3)" }}>Nivel de experiencia</span>
                    <div className="grid grid-cols-3 gap-2">
                      {([{ id: "novato", l: "Novato" }, { id: "intermedio", l: "Pro" }, { id: "avanzado", l: "Elite" }] as const).map((lv) => (
                        <button
                          key={lv.id}
                          type="button"
                          onClick={() => setValue("level", lv.id)}
                          className={cn(
                            "py-3 rounded-xl border text-[10px] font-mono uppercase tracking-[0.18em] transition-all duration-150",
                            watch("level") === lv.id
                              ? "bg-[var(--ngx-purple)] text-white border-[var(--ngx-purple)] shadow-[var(--ngx-glow-primary-soft)]"
                              : "bg-white/[0.03] text-white/45 border-white/10 hover:border-white/20 hover:text-white/70"
                          )}
                        >
                          {lv.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="ngx-card !p-6">
                    <span className="ngx-eyebrow !text-[10px] block mb-4" style={{ color: "var(--ngx-fg-3)" }}>Días disponibles por semana</span>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setValue("weeklyTime", d)}
                          className={cn(
                            "py-3 rounded-xl border text-xs font-mono uppercase tracking-[0.14em] transition-all duration-150",
                            watch("weeklyTime") === d
                              ? "bg-[var(--ngx-purple)] text-white border-[var(--ngx-purple)] shadow-[var(--ngx-glow-primary-soft)]"
                              : "bg-white/[0.03] text-white/45 border-white/10 hover:border-white/20 hover:text-white/70"
                          )}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ngx-section-panel !p-6 md:!p-8">
                  <span className="ngx-eyebrow !text-[10px] block mb-5" style={{ color: "var(--ngx-fg-3)" }}>Zona de enfoque principal</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {([
                      { id: "upper", l: "Tren Superior" }, { id: "lower", l: "Tren Inferior" },
                      { id: "abs", l: "Core & Abs" }, { id: "full", l: "Full Body" }
                    ] as const).map((z) => (
                      <button
                        key={z.id}
                        type="button"
                        onClick={() => setValue("focusZone", z.id)}
                        className={cn(
                          "p-4 rounded-xl border text-center cursor-pointer transition-all duration-150 active:scale-[0.97]",
                          watch("focusZone") === z.id
                            ? "bg-[var(--ngx-purple)] border-[var(--ngx-purple)] text-white shadow-[var(--ngx-glow-primary-soft)]"
                            : "bg-white/[0.02] border-white/10 text-white/55 hover:text-white/85 hover:border-white/20"
                        )}
                      >
                        <span className="text-xs font-mono uppercase tracking-[0.16em]">{z.l}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 4: SOFTWARE (MENTAL) */}
            {currentStage === 4 && (
              <div className="w-full max-w-4xl mx-auto animate-in slide-in-from-right-8 fade-in duration-500 flex flex-col items-center justify-center h-full space-y-8">
                <div className="text-center">
                  <span className="ngx-eyebrow-pill mb-4 mx-auto">Paso 4 · Cierre privado</span>
                  <h2 className="ngx-h1 mx-auto !text-center" style={{ maxWidth: "20ch" }}>
                    Cerramos la calibración y activamos tu acceso.
                  </h2>
                  <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
                    Un último ajuste mental y el correo donde quieres recibir tu acceso privado. Después sí generamos la visualización y el siguiente paso.
                  </p>
                </div>

                <div className="w-full ngx-section-panel !p-6 md:!p-8 space-y-5">
                  <CyberSlider
                    label="Nivel de Disciplina"
                    {...register("disciplineRating")}
                    min={1} max={10}
                    valueDisplay={watch("disciplineRating") + "/10"}
                    trackColor="amber"
                  />
                  <CyberSlider
                    label="Calidad de Sueño"
                    {...register("sleepQuality")}
                    min={1} max={10}
                    valueDisplay={watch("sleepQuality") + "/10"}
                    trackColor="violet"
                  />
                  <CyberSlider
                    label="Carga de Estrés"
                    {...register("stressLevel")}
                    min={1} max={10}
                    valueDisplay={watch("stressLevel") + "/10"}
                    trackColor="red"
                  />
                </div>

                <div className="w-full ngx-card !p-5 md:!p-6">
                  <div>
                    <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Acceso privado</span>
                    {user?.email && !usingAnonymousAccess ? (
                      <>
                        <p className="mt-2 text-sm text-white">{user.email}</p>
                        <Input
                          {...register("email")}
                          readOnly
                          className="sr-only"
                          aria-hidden="true"
                          tabIndex={-1}
                        />
                      </>
                    ) : (
                      <>
                        <div className="relative mt-3">
                          <Input
                            {...register("email")}
                            type="email"
                            placeholder="tu@email.com"
                            className="bg-white/5 border-white/10 rounded-2xl py-6 pl-12 text-white focus:border-[var(--ngx-purple)] transition-all"
                          />
                          <Eye className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        </div>
                        <p className="mt-2 text-xs text-white/45 leading-relaxed">
                          Te enviaremos aquí el enlace privado a tu visualización y a tu roadmap inicial. No te pediremos contraseña en este paso.
                        </p>
                      </>
                    )}
                    {errors.email ? (
                      <p className="mt-2 text-left text-xs text-red-300">{errors.email.message}</p>
                    ) : null}
                  </div>

                  <label className="mt-4 flex items-start gap-3 cursor-pointer group border-t border-white/[0.06] pt-4">
                    <input
                      type="checkbox"
                      checked={consentEmail}
                      onChange={(e) => setConsentEmail(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-[var(--ngx-purple)]"
                    />
                    <span className="text-xs text-white/55 group-hover:text-white/80 transition-colors leading-relaxed">
                      Quiero recibir correos de seguimiento y novedades de NGX Transform. <span className="text-white/35">(opcional)</span>
                    </span>
                  </label>
                </div>

                <div className="w-full ngx-card !p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Acceso</span>
                    <p className="mt-1.5 text-sm text-white">{resolvedEmail || "Pendiente de confirmar"}</p>
                  </div>
                  <div>
                    <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Foto</span>
                    <p className="mt-1.5 text-sm text-white">{previewUrl ? "Cargada y lista para procesarse" : "No detectada"}</p>
                  </div>
                  <div>
                    <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Objetivo</span>
                    <p className="mt-1.5 text-sm text-white">{selectedGoalLabel}</p>
                  </div>
                  <div>
                    <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Enfoque</span>
                    <p className="mt-1.5 text-sm text-white">{selectedFocusLabel}</p>
                  </div>
                </div>

                {!canSubmitWizard ? (
                  <p className="text-center text-xs text-amber-300">
                    Antes de generar tu visualización necesitamos un correo válido y conservar la foto cargada del paso 1.
                  </p>
                ) : null}

                <p className="max-w-2xl text-center text-xs text-white/45 leading-relaxed">
                  En el siguiente paso generaremos una visualización aproximada de tu potencial con IA. Después podrás ver un roadmap inicial para entender qué necesitarías construir antes de pensar en un sistema más serio.
                </p>

                <div className="w-full">
                  <Button
                    type="submit"
                    disabled={!canSubmitWizard || loading}
                    className="w-full rounded-full bg-[var(--ngx-purple)] py-6 text-base font-bold uppercase tracking-[0.14em] text-white shadow-[var(--ngx-glow-primary)] transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] disabled:bg-white/[0.06] disabled:text-white/30 disabled:shadow-none disabled:translate-y-0"
                  >
                    Generar visualización y siguiente paso
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* NAVIGATION FOOTER */}
            {currentStage > 1 && (
              <div className="fixed bottom-0 left-0 w-full px-4 pb-5 pt-10 bg-gradient-to-t from-black via-black/90 to-transparent z-40 pointer-events-none md:px-6">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 rounded-full border border-white/[0.08] bg-black/55 backdrop-blur-2xl px-3 py-3 pointer-events-auto shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                  <button
                    type="button"
                    onClick={prevStage}
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-mono uppercase tracking-[0.18em] text-white/45 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <ChevronLeft size={14} /> Anterior
                  </button>

                  <div className="hidden md:flex items-center gap-2">
                    <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>
                      Paso {currentStage} / 4
                    </span>
                    <span className="h-3 w-px bg-white/15" />
                    <span className="text-sm text-white/75">{stageMeta.title}</span>
                  </div>

                  {currentStage < 4 && (
                    <button
                      type="button"
                      onClick={nextStage}
                      className="flex items-center gap-2 rounded-full bg-[var(--ngx-purple)] px-5 py-2.5 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-white shadow-[var(--ngx-glow-primary-soft)] transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.97]"
                    >
                      Siguiente <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </form>
    </div>
  );
}
