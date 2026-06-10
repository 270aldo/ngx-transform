"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ensureAnonymousSession, getClientStorage } from "@/lib/firebaseClient";
import { ref, uploadBytes } from "firebase/storage";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/shadcn/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { useAuth } from "@/components/auth/AuthProvider";
import { ChevronRight, ChevronLeft, Lock } from "lucide-react";
import { getStoredVariant } from "@/hooks/useVariantTracking";

// Wizard components
import {
  WizardCommandBar,
  WizardPhotoStep,
  WizardProfileStep,
  WizardObjectiveStep,
  WizardClosingStep,
  WizardFormSchema,
  type WizardFormValues,
  type WizardStageTab,
} from "@/components/wizard";

type FormValues = WizardFormValues;
const FormSchema = WizardFormSchema;

function createSessionSeed(): string {
  const randomPart =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return randomPart.replace(/-/g, "").slice(0, 12);
}

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
    subtitle: "Confirma correo para enviar y recuperar tu resultado",
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

function WizardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema) as Resolver<FormValues>,
    defaultValues: {
      email: "",
      sex: "male",
      level: "novato",
      goal: "definicion",
      trainingDaysPerWeek: 3,
      sessionDurationMinutes: 60,
      weeklyTime: 3,
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

  const photoFile = useWatch({ control, name: "photo" });
  const watchedEmail = useWatch({ control, name: "email" });
  const watchedGoal = useWatch({ control, name: "goal" });
  const watchedFocusZone = useWatch({ control, name: "focusZone" });
  const watchedTrainingDays = useWatch({ control, name: "trainingDaysPerWeek" });
  const watchedSessionMinutes = useWatch({ control, name: "sessionDurationMinutes" });
  const selectedPhoto = photoFile?.[0] ?? null;
  const resolvedEmail = (watchedEmail || user?.email || "").trim();
  const usingAnonymousAccess = Boolean(user?.isAnonymous);
  const canAdvancePastIdentity = Boolean(previewUrl && requiredConsentsAccepted && accessReady);
  const canSubmitWizard = Boolean(previewUrl && requiredConsentsAccepted && resolvedEmail && accessReady);
  const selectedGoalLabel =
    watchedGoal === "definicion"
      ? "Recomposición atlética"
      : watchedGoal === "masa"
        ? "Construir músculo funcional"
        : "Híbrido de rendimiento";
  const selectedFocusLabel =
    watchedFocusZone === "upper"
      ? "Tren superior"
      : watchedFocusZone === "lower"
        ? "Tren inferior"
        : watchedFocusZone === "abs"
          ? "Core & abs"
          : "Full body";

  // Dev-only stage jump for QA: ?stage=2|3|4. Runs after hydration to avoid
  // rendering a different initial step on the server and client.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const param = searchParams.get("stage");
    const n = Number(param);
    if (Number.isInteger(n) && n >= 1 && n <= 4) {
      const id = window.setTimeout(() => setCurrentStage(n), 0);
      return () => window.clearTimeout(id);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const defer = (fn: () => void) => {
      const id = setTimeout(() => {
        if (!cancelled) fn();
      }, 0);
      timers.push(id);
    };

    if (DEMO) {
      defer(() => {
        setAccessReady(true);
        setAccessError(null);
      });
      return () => {
        cancelled = true;
        timers.forEach(clearTimeout);
      };
    }

    if (authLoading) {
      return () => {
        cancelled = true;
        timers.forEach(clearTimeout);
      };
    }

    if (user) {
      defer(() => {
        setAccessReady(true);
        setAccessError(null);
      });
      return () => {
        cancelled = true;
        timers.forEach(clearTimeout);
      };
    }

    defer(() => {
      setAccessReady(false);
      setAccessError(null);
    });

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
      timers.forEach(clearTimeout);
    };
  }, [DEMO, authLoading, user]);

  useEffect(() => {
    if (user?.email && watchedEmail !== user.email) {
      setValue("email", user.email, { shouldValidate: true, shouldDirty: false });
    }
  }, [user?.email, watchedEmail, setValue]);

  const trainingDays = watchedTrainingDays || 3;
  const sessionMinutes = watchedSessionMinutes || 60;
  useEffect(() => {
    const weeklyHours = Math.max(1, Math.min(14, (trainingDays * sessionMinutes) / 60));
    setValue("weeklyTime", weeklyHours, { shouldValidate: true, shouldDirty: true });
  }, [trainingDays, sessionMinutes, setValue]);

  useEffect(() => {
    const id = window.setTimeout(() => setFormError(null), 0);
    return () => window.clearTimeout(id);
  }, [currentStage]);

  useEffect(() => {
    if (!selectedPhoto) {
      const id = window.setTimeout(() => setPreviewUrl(null), 0);
      return () => window.clearTimeout(id);
    }

    const objectUrl = URL.createObjectURL(selectedPhoto);
    const id = window.setTimeout(() => setPreviewUrl(objectUrl), 0);
    return () => {
      window.clearTimeout(id);
      URL.revokeObjectURL(objectUrl);
    };
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
        throw new Error("Confirma el correo donde quieres recibir y recuperar tu resultado privado antes de ejecutar la visualización.");
      }

      // Staged processing states for the private visualization flow
      setProcessStage("upload"); setProcessProgress(20); await new Promise(r => setTimeout(r, 800));

      const sessionSeed = createSessionSeed();
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

      const profile = {
        ...values,
        weeklyTime: Math.max(
          1,
          Math.min(14, ((values.trainingDaysPerWeek || 3) * (values.sessionDurationMinutes || 60)) / 60)
        ),
        bodyType: values.bodyType || "mesomorph",
        notes: values.notes || "",
      };
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
            // Signal the loading screen so it offers retry immediately instead
            // of polling a stuck "processing" session forever (fix-20).
            router.replace(`/loading/${sessionId}?analyzeFailed=1`);
          }
        } catch (bootstrapError) {
          console.error("[Wizard] Analyze bootstrap error:", bootstrapError);
          router.replace(`/loading/${sessionId}?analyzeFailed=1`);
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
    <div className="ngx-wizard-shell relative min-h-screen overflow-x-hidden text-white selection:bg-[#6D00FF]/30 font-[var(--font-body)]">

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
      <form onSubmit={handleSubmit(onSubmit, onFormError)} className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-24 pt-32 md:px-6 md:pb-28 md:pt-36">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Sube tu foto base"
          className="sr-only"
          onChange={onPhotoInputChange}
          ref={inputRef}
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
                    <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#C8A5FF]">
                      Sesión segura
                    </p>
                    <p className="text-sm leading-relaxed text-white/75">
                      Mantén esta ventana abierta unos momentos. En cuanto quede listo te llevaremos a la vista donde podrás seguir cada etapa.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-white/45">
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

            {/* STAGE 2: PERFIL CORPORAL */}
            {currentStage === 2 && (
              <WizardProfileStep register={register} watch={watch} setValue={setValue} />
            )}

            {/* STAGE 3: OBJETIVO Y CONTEXTO */}
            {currentStage === 3 && (
              <WizardObjectiveStep watch={watch} setValue={setValue} />
            )}

            {/* STAGE 4: CIERRE PRIVADO */}
            {currentStage === 4 && (
              <WizardClosingStep
                register={register}
                watch={watch}
                errors={errors}
                authedEmail={user?.email ?? null}
                usingAnonymousAccess={usingAnonymousAccess}
                consentEmail={consentEmail}
                onChangeConsentEmail={setConsentEmail}
                resolvedEmail={resolvedEmail}
                selectedGoalLabel={selectedGoalLabel}
                selectedFocusLabel={selectedFocusLabel}
                previewUrl={previewUrl}
                canSubmitWizard={canSubmitWizard}
                loading={loading}
              />
            )}

            {/* NAVIGATION FOOTER */}
            {currentStage > 1 && (
              <div className="mt-8 w-full pb-2 z-10">
                <div className="ngx-wizard-footerbar max-w-5xl mx-auto flex items-center justify-between gap-3 px-3 py-3 pointer-events-auto">
                  <button
                    type="button"
                    onClick={prevStage}
                    className="ngx-wizard-footer-button flex items-center gap-2 px-4 py-2"
                  >
                    <ChevronLeft size={14} /> Anterior
                  </button>

                  <div className="hidden md:flex items-center gap-2">
                    <span className="ngx-eyebrow !text-[11px]" style={{ color: "var(--ngx-fg-3)" }}>
                      Paso {currentStage} / 4
                    </span>
                    <span className="h-3 w-px bg-white/15" />
                    <span className="font-display text-sm font-black uppercase leading-none text-white/75">{stageMeta.title}</span>
                  </div>

                  {currentStage < 4 && (
                    <button
                      type="button"
                      onClick={nextStage}
                      className="ngx-wizard-footer-primary flex items-center gap-2 px-5 py-2.5"
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

export default function WizardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--ngx-bg)] text-white" />
      }
    >
      <WizardPageContent />
    </Suspense>
  );
}
