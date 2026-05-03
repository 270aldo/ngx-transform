"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ensureAnonymousSession, getClientStorage } from "@/lib/firebaseClient";
import { ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input"; // Kept for text fields
import { useToast } from "@/components/ui/toast-provider";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { Eye, Target, Activity, Cpu, ArrowRight, Upload, ChevronRight, ChevronLeft, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { getStoredVariant } from "@/hooks/useVariantTracking";

// New Components
import { EliteOptionCard } from "@/components/EliteOptionCard";
import { CyberSlider } from "@/components/CyberSlider";

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
    title: "Sincronización visual",
    subtitle: "Carga y validación privada de imagen",
  },
  2: {
    title: "Perfil corporal",
    subtitle: "Definiendo parámetros físicos base",
  },
  3: {
    title: "Objetivo de misión",
    subtitle: "Define el objetivo de esta visualización",
  },
  4: {
    title: "Calibración mental",
    subtitle: "Ajuste de parámetros psicométricos",
  },
};

const WIZARD_STAGE_TABS = [
  { id: 1, short: "Foto" },
  { id: 2, short: "Perfil" },
  { id: 3, short: "Objetivo" },
  { id: 4, short: "Cierre" },
] as const;

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
  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const dt = new DataTransfer();
      dt.items.add(file);
      if (inputRef.current) inputRef.current.files = dt.files;
      setValue("photo", dt.files as unknown as FileList);
    }
  }, [setValue]);

  const onDrag = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);

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

      {/* TOP HEADER */}
      <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6 md:pt-6">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-3 md:items-center pointer-events-none">
          <div className="landing-surface pointer-events-auto flex min-w-0 items-center gap-3 rounded-[28px] px-3 py-3 md:px-4 md:py-3.5">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 text-[10px] font-medium uppercase tracking-[0.22em] text-white/75 transition-colors hover:bg-black/55 hover:text-white"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Atrás</span>
            </button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#6D00FF]/25 bg-gradient-to-br from-[#6D00FF]/30 to-[#B98CFF]/10">
              <Sparkles size={18} className="text-[#C6A4FF]" />
            </div>
            <div className="min-w-0">
              <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">Wizard privado</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-body font-semibold uppercase tracking-[0.04em] text-white md:text-base">
                  Configuración privada
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
                  Paso {currentStage} / 4
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-white/40">
                {stageMeta.subtitle}
              </p>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-full landing-surface px-2 py-2">
              {WIZARD_STAGE_TABS.map((tab) => (
                <div
                  key={tab.id}
                  className={cn(
                    "rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition-all",
                    currentStage === tab.id
                      ? "bg-[#6D00FF] text-white shadow-[0_0_18px_rgba(109,0,255,0.25)]"
                      : currentStage > tab.id
                        ? "bg-[#6D00FF]/12 text-[#C9A9FF]"
                        : "bg-white/[0.03] text-white/32"
                  )}
                >
                  {tab.short}
                </div>
              ))}
            </div>
            {DEMO ? (
              <div className="rounded-full border border-[#6D00FF]/30 bg-[#6D00FF]/15 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.22em] text-[#C6A4FF]">
                Demo mode
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <form onSubmit={handleSubmit(onSubmit, onFormError)} className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-24 pt-32 md:px-6 md:pb-28 md:pt-36">
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          {...register("photo")}
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
            {/* STAGE 1: IDENTITY */}
            {currentStage === 1 && (
              <div className="w-full animate-in slide-in-from-right-8 fade-in duration-500">
                <section className="rounded-[32px] landing-surface-strong p-6 md:p-8 lg:p-10">
                  <div className="grid gap-8 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:gap-10">
                    <div className="flex flex-col">
                      <p className="landing-kicker mb-4">Paso 1 · foto base</p>
                      <h1 className="landing-heading text-[2.7rem] leading-[0.9] text-white md:text-[4rem] lg:text-[4.5rem]">
                        Sube tu foto.
                        <br />
                        Activamos tu acceso privado.
                      </h1>
                      <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 md:text-[1.05rem]">
                        Tu foto es el punto de partida. Sube una foto real, da tu consentimiento y GENESIS empieza a trabajar con lo que tienes.
                      </p>

                      <div className="mt-7 rounded-[24px] landing-surface px-5 py-5 text-left">
                        <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">Contrato de experiencia</p>
                        <p className="mt-3 text-sm leading-relaxed text-white/80 md:text-[0.95rem]">
                          Esto no es un diagnóstico médico ni una predicción exacta. Es una visualización privada y motivacional generada con IA para ayudarte a imaginar tu potencial y abrir una conversación más seria sobre lo que te acercaría a él.
                        </p>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        {[
                          {
                            icon: ShieldCheck,
                            label: "Privado por diseño",
                            text: "Tu foto se usa sólo para operar esta experiencia.",
                          },
                          {
                            icon: Sparkles,
                            label: "Salida aproximada",
                            text: "Es motivacional, no clínica ni exacta.",
                          },
                          {
                            icon: Mail,
                            label: "Correo al final",
                            text: "Primero avanzas sin fricción. El acceso llega después.",
                          },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <div key={item.label} className="rounded-[22px] landing-surface px-4 py-4">
                              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-[#6D00FF]/20 bg-[#6D00FF]/10">
                                <Icon className="h-4 w-4 text-[#C6A4FF]" />
                              </div>
                              <p className="text-sm font-semibold text-white">{item.label}</p>
                              <p className="mt-2 text-xs leading-relaxed text-white/45">{item.text}</p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-6 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-relaxed text-white/50">
                        Si la imagen no está lista, no te pediremos el resto. Primero resolvemos la base.
                      </div>
                    </div>

                    <div className="rounded-[28px] landing-surface p-4 md:p-5">
                      <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-4">
                        <div>
                          <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">Foto base</p>
                          <p className="mt-2 text-lg font-semibold text-white">Carga privada de imagen</p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
                          {previewUrl ? "Archivo listo" : "Cuerpo completo"}
                        </span>
                      </div>

                      <label
                        onDrop={onDrop}
                        onDragOver={onDrag}
                        onDragEnter={onDrag}
                        onClick={() => inputRef.current?.click()}
                        className={cn(
                          "group relative mt-5 flex min-h-[360px] md:min-h-[420px] w-full flex-col items-center justify-center overflow-hidden rounded-[28px] border border-dashed transition-all cursor-pointer",
                          previewUrl
                            ? "border-[#6D00FF]/45 bg-[#6D00FF]/6"
                            : "border-white/12 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]"
                        )}
                      >
                        {previewUrl ? (
                          <>
                            <Image src={previewUrl} alt="Preview" fill className="z-10 object-contain p-4 md:p-5" />
                            <Image src={previewUrl} alt="Blur" fill className="z-0 object-cover blur-2xl opacity-20 scale-110" />
                            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                            <div className="absolute left-5 top-5 z-20 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-md">
                              Vista previa protegida
                            </div>
                            <div className="absolute bottom-5 left-5 right-5 z-20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-white">Imagen detectada y lista para validarse</p>
                                <p className="mt-1 text-xs leading-relaxed text-white/55">
                                  Si quieres, puedes reemplazarla antes de pasar al perfil corporal.
                                </p>
                              </div>
                              <div className="inline-flex items-center gap-2 rounded-full bg-[#6D00FF] px-4 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(109,0,255,0.35)]">
                                <Upload size={16} />
                                Cambiar archivo
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="max-w-sm px-6 text-center transition-transform group-hover:scale-[1.02]">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#6D00FF]/25 bg-[#6D00FF]/10 shadow-[0_0_30px_rgba(109,0,255,0.18)]">
                              <Upload className="h-8 w-8 text-[#6D00FF]" />
                            </div>
                            <h3 className="mt-6 text-[1.45rem] font-black italic uppercase tracking-[-0.05em] text-white">
                              Arrastra tu foto o haz clic
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-white/50">
                              JPG o PNG, máximo 8MB. Idealmente cuerpo completo, buena luz y una pose simple.
                            </p>
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                              {["Privado", "Aproximado", "Sin login aún"].map((item) => (
                                <span
                                  key={item}
                                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/45"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </label>

                      {previewUrl ? (
                        <div className="mt-5 animate-in fade-in duration-300">
                          <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-left">
                            <label className="flex items-start gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={consentTerms}
                                onChange={(e) => setConsentTerms(e.target.checked)}
                                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-[#6D00FF]"
                              />
                              <span className="text-xs leading-relaxed text-white/55 transition-colors group-hover:text-white/75">
                                Soy mayor de 18 años. He leído y acepto los{" "}
                                <a href="/terms" target="_blank" className="text-[#B98CFF] underline">Términos de Servicio</a>{" "}y el{" "}
                                <a href="/privacy" target="_blank" className="text-[#B98CFF] underline">Aviso de Privacidad</a>.
                              </span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={consentAI}
                                onChange={(e) => setConsentAI(e.target.checked)}
                                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-[#6D00FF]"
                              />
                              <span className="text-xs leading-relaxed text-white/55 transition-colors group-hover:text-white/75">
                                Autorizo que mi foto sea procesada por inteligencia artificial (Google Gemini) para generar mi visualización privada y el contexto inicial del siguiente paso. Entiendo que se almacena de forma segura solo mientras sea necesario para prestar el servicio.
                              </span>
                            </label>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-5 text-xs leading-relaxed text-white/35">
                          Cuando detectemos una imagen válida, te pediremos los consentimientos obligatorios para desbloquear el perfil corporal.
                        </p>
                      )}

                      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-sm text-xs leading-relaxed text-white/42">
                          El correo se confirma al final, justo antes de generar tu visualización privada. Aquí no te pediremos contraseña.
                        </p>
                        <Button
                          type="button"
                          onClick={nextStage}
                          disabled={!canAdvancePastIdentity}
                          className="h-auto rounded-full bg-[#6D00FF] px-7 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[0_0_30px_rgba(109,0,255,0.32)] transition-all hover:scale-[1.01] hover:bg-[#5f00de] disabled:bg-white/8 disabled:text-white/30 disabled:shadow-none"
                        >
                          Continuar al perfil
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* STAGE 2: BIOMETRICS */}
            {currentStage === 2 && (
              <div className="w-full max-w-5xl mx-auto animate-in slide-in-from-right-8 fade-in duration-500 space-y-8">
                <div className="text-center">
                  <p className="landing-kicker mb-4">Paso 2 · Perfil corporal</p>
                  <h2 className="landing-heading text-[2.4rem] leading-[0.92] text-white md:text-[3.4rem]">
                    Le damos contexto
                    <br />
                    a tu punto de partida.
                  </h2>
                  <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
                    Estos datos no sustituyen una medición clínica. Sólo calibran el rango de la visualización para que no se sienta como un juguete genérico.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-start">
                  <div className="space-y-5 rounded-[30px] landing-surface-strong p-5 md:p-6">
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

                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                      <label className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/45 block">Género biológico</label>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {(["male", "female"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setValue("sex", s)}
                            className={cn(
                              "py-3 rounded-xl border text-[10px] font-mono uppercase tracking-[0.18em] transition-all",
                              watch("sex") === s
                                ? "bg-[#6D00FF] text-white border-[#6D00FF] shadow-[0_0_18px_rgba(109,0,255,0.22)]"
                                : "bg-white/[0.03] text-white/45 border-white/10 hover:border-white/20 hover:text-white/70"
                            )}
                          >
                            {s === "male" ? "Masculino" : "Femenino"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/45">
                      Mientras más honestos sean estos datos, mejor se sentirá el puente entre la visualización y el roadmap.
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[30px] landing-surface p-5 md:p-6">
                      <label className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/45 block">Tipo somático</label>
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

                    <div className="rounded-[24px] landing-surface px-5 py-5">
                      <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">Lectura inicial</p>
                      <p className="mt-3 text-base font-semibold text-white">Todavía no estamos diagnosticando.</p>
                      <p className="mt-2 text-sm leading-relaxed text-white/50">
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
                  <p className="landing-kicker mb-4">Paso 3 · objetivo</p>
                  <h2 className="landing-heading text-[2.4rem] leading-[0.92] text-white md:text-[3.4rem]">
                    Define la dirección
                    <br />
                    de tu visualización.
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
                  <div className="rounded-[28px] landing-surface p-6">
                    <label className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/45 mb-4 block">Nivel de experiencia</label>
                    <div className="grid grid-cols-3 gap-2">
                      {([{ id: "novato", l: "Novato" }, { id: "intermedio", l: "Pro" }, { id: "avanzado", l: "Elite" }] as const).map((lv) => (
                        <button
                          key={lv.id}
                          type="button"
                          onClick={() => setValue("level", lv.id)}
                          className={cn(
                            "py-3 rounded-xl border text-[10px] font-mono uppercase tracking-[0.18em] transition-all",
                            watch("level") === lv.id
                              ? "bg-[#6D00FF] text-white border-[#6D00FF] shadow-[0_0_18px_rgba(109,0,255,0.22)]"
                              : "bg-white/[0.03] text-white/45 border-white/10 hover:border-white/20 hover:text-white/70"
                          )}
                        >
                          {lv.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] landing-surface p-6">
                    <label className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/45 mb-4 block">Días disponibles por semana</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setValue("weeklyTime", d)}
                          className={cn(
                            "py-3 rounded-xl border text-xs font-mono uppercase tracking-[0.14em] transition-all",
                            watch("weeklyTime") === d
                              ? "bg-[#6D00FF] text-white border-[#6D00FF] shadow-[0_0_18px_rgba(109,0,255,0.22)]"
                              : "bg-white/[0.03] text-white/45 border-white/10 hover:border-white/20 hover:text-white/70"
                          )}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[30px] landing-surface-strong p-6 md:p-8">
                  <div className="mb-6 flex justify-between items-center">
                    <label className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/45">Zona de enfoque principal</label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {([
                      { id: "upper", l: "Tren Superior" }, { id: "lower", l: "Tren Inferior" },
                      { id: "abs", l: "Core & Abs" }, { id: "full", l: "Full Body" }
                    ] as const).map((z) => (
                      <div
                        key={z.id}
                        onClick={() => setValue("focusZone", z.id)}
                        className={cn(
                          "p-4 rounded-xl border text-center cursor-pointer transition-all hover:scale-105 active:scale-95",
                          watch("focusZone") === z.id
                            ? "bg-[#6D00FF] border-[#6D00FF] text-white shadow-[0_0_20px_rgba(109,0,255,0.28)]"
                            : "bg-black/30 border-white/10 text-white/45 hover:text-white/80 hover:border-white/20"
                        )}
                      >
                        <div className="text-xs font-mono uppercase tracking-[0.16em]">{z.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 4: SOFTWARE (MENTAL) */}
            {currentStage === 4 && (
              <div className="w-full max-w-4xl mx-auto animate-in slide-in-from-right-8 fade-in duration-500 flex flex-col items-center justify-center h-full space-y-8">
                <div className="text-center">
                  <p className="landing-kicker mb-4">Paso 4 · cierre</p>
                  <h2 className="landing-heading text-[2.4rem] leading-[0.92] text-white md:text-[3.2rem]">
                    Cerramos la calibración
                    <br />
                    y activamos tu acceso.
                  </h2>
                  <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
                    Un último ajuste mental y el correo donde quieres recibir tu acceso privado. Después sí generamos la visualización y el siguiente paso.
                  </p>
                </div>

                <div className="w-full space-y-5 rounded-[30px] landing-surface-strong p-6 md:p-8">
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

                <div className="grid w-full grid-cols-1 gap-4 rounded-[28px] landing-surface p-5 md:p-6">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/45">Acceso privado</p>
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
                            className="bg-white/5 border-white/10 rounded-2xl py-6 pl-12 text-white focus:border-[#6D00FF] transition-all"
                          />
                          <Eye className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
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

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={consentEmail}
                      onChange={(e) => setConsentEmail(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-[#6D00FF]"
                    />
                    <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors leading-relaxed">
                      Quiero recibir correos de seguimiento y novedades de NGX Transform. Es opcional y puedo cancelar en cualquier momento.
                    </span>
                  </label>
                </div>

                <div className="grid w-full grid-cols-1 gap-3 rounded-[28px] landing-surface p-5 md:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/45">Acceso</p>
                    <p className="mt-1 text-sm text-white">{resolvedEmail || "Pendiente de confirmar"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/45">Foto</p>
                    <p className="mt-1 text-sm text-white">{previewUrl ? "Cargada y lista para procesarse" : "No detectada"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/45">Objetivo</p>
                    <p className="mt-1 text-sm text-white">{selectedGoalLabel}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/45">Enfoque</p>
                    <p className="mt-1 text-sm text-white">{selectedFocusLabel}</p>
                  </div>
                </div>

                {!canSubmitWizard ? (
                  <p className="mt-4 text-center text-xs text-amber-300">
                    Antes de generar tu visualización necesitamos un correo válido y conservar la foto cargada del paso 1.
                  </p>
                ) : null}

                <p className="mt-6 max-w-2xl text-center text-xs text-white/45 leading-relaxed">
                  En el siguiente paso generaremos una visualización aproximada de tu potencial con IA. Después podrás ver un roadmap inicial para entender qué necesitarías construir antes de pensar en un sistema más serio.
                </p>

                <div className="w-full">
                  <Button
                    type="submit"
                    disabled={!canSubmitWizard || loading}
                    className="w-full rounded-[22px] bg-[#6D00FF] py-7 text-base font-semibold uppercase tracking-[0.14em] text-white shadow-[0_0_40px_rgba(109,0,255,0.32)] transition-transform hover:scale-[1.01] hover:bg-[#5800cc] active:scale-[0.99]"
                  >
                    GENERAR VISUALIZACIÓN Y SIGUIENTE PASO
                  </Button>
                </div>
              </div>
            )}

            {/* NAVIGATION FOOTER */}
            {currentStage > 1 && (
              <div className="fixed bottom-0 left-0 w-full px-4 pb-5 pt-10 bg-gradient-to-t from-black via-black/90 to-transparent z-40 pointer-events-none md:px-6">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 rounded-full landing-surface px-3 py-3 pointer-events-auto">
                  <button
                    type="button"
                    onClick={prevStage}
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-mono uppercase tracking-[0.18em] text-white/45 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <ChevronLeft size={14} /> Anterior
                  </button>

                  <div className="hidden md:block text-center">
                    <p className="landing-kicker !text-[0.58rem] !tracking-[0.2em]">Paso {currentStage} de 4</p>
                    <p className="mt-1 text-sm text-white/65">{stageMeta.title}</p>
                  </div>

                  {currentStage < 4 && (
                    <button
                      type="button"
                      onClick={nextStage}
                      className="flex items-center gap-2 rounded-full bg-[#6D00FF] px-6 py-3 text-[10px] font-mono uppercase tracking-[0.18em] text-white shadow-[0_0_24px_rgba(109,0,255,0.25)] transition-transform hover:scale-[1.01] hover:bg-[#5f00de]"
                    >
                      Siguiente fase <ChevronRight size={14} />
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
