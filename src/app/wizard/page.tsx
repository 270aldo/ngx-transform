"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getClientStorage } from "@/lib/firebaseClient";
import { ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input"; // Kept for text fields
import { useToast } from "@/components/ui/toast-provider";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { Eye, Target, Activity, Cpu, ArrowRight, Upload, ChevronRight, ChevronLeft } from "lucide-react";
import { getStoredVariant } from "@/hooks/useVariantTracking";

// New Components
import { EliteOptionCard } from "@/components/EliteOptionCard";
import { CyberSlider } from "@/components/CyberSlider";

const FormSchema = z.object({
  email: z.string().email(),
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
  photo: z.any(),
});

type FormValues = z.infer<typeof FormSchema>;

// STAGES DEFINITION
const STAGES = [
  { id: 1, title: "Sincronización de Identidad", sub: "Biometría Visual", icon: Eye },
  { id: 2, title: "Análisis de Hardware", sub: "Datos Corporales", icon: Cpu },
  { id: 3, title: "Objetivo de Misión", sub: "Definición de Target", icon: Target },
  { id: 4, title: "Calibración de Software", sub: "Mentalidad y Estilo", icon: Activity },
];

export const dynamic = "force-dynamic";

function LoadingMessages({ stage }: { stage: string }) {
  const [msgIndex, setMsgIndex] = useState(0);

  const analyzeMessages = [
    "ANALIZANDO ESTRUCTURA FÍSICA...",
    "CALCULANDO VECTORES DE HIPERTROFIA...",
    "PROCESANDO BIOMETRÍA...",
    "GENERANDO LÍNEA DE TIEMPO...",
    "OPTIMIZANDO PARÁMETROS..."
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
  if (stage === 'upload') text = "SUBIENDO DATOS...";
  else if (stage === 'render') text = "INICIANDO SIMULACIÓN...";
  else if (stage === 'done') text = "COMPLETADO.";
  else text = analyzeMessages[msgIndex];

  return (
    <h2 key={text} className="text-2xl font-black italic tracking-tighter mb-2 min-h-[2rem] animate-in fade-in slide-in-from-bottom-2 duration-300">
      {text}
    </h2>
  );
}

export default function WizardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const { addToast } = useToast();
  const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "1";
  const { user, loading: authLoading, getIdToken } = useAuth();

  // Processing States
  const [processStage, setProcessStage] = useState<"idle" | "upload" | "analyze" | "render" | "done">("idle");
  const [processProgress, setProcessProgress] = useState(0);

  // Consent States
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentAI, setConsentAI] = useState(false);
  const [consentEmail, setConsentEmail] = useState(false);
  const allConsent = consentTerms && consentAI && consentEmail;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(FormSchema) as any,
    defaultValues: {
      sex: "male",
      level: "novato",
      goal: "definicion",
      weeklyTime: 5,
      bodyType: "mesomorph",
      bodyFatLevel: "medio",
      interest: "cinematic",
      disciplineRating: 7,
      stressLevel: 5,
      sleepQuality: 7,
      age: 25,
      heightCm: 175,
      weightKg: 75,
    } as any,
  });

  const photoFile = watch("photo");
  const previewUrl = photoFile && photoFile[0] ? URL.createObjectURL(photoFile[0]) : null;

  useEffect(() => {
    if (!DEMO && !authLoading && !user) {
      router.push("/auth?next=/wizard");
    }
  }, [DEMO, authLoading, user, router]);

  useEffect(() => {
    if (user?.email) setValue("email", user.email);
  }, [user?.email, setValue]);

  const onFormError = (errs: any) => {
    console.log("Validation Errors:", errs);
    const firstError = Object.values(errs)[0] as any;
    if (firstError) {
      addToast({ variant: "error", message: `Error: ${firstError.message || "Verifica los datos de calibración"}` });
    }
  };

  // --- ACTIONS ---
  const nextStage = () => {
    // Ideally validate current step fields here before moving
    if (currentStage < 4) setCurrentStage(c => c + 1);
  };

  const prevStage = () => {
    if (currentStage > 1) setCurrentStage(c => c - 1);
  };

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
      if (!user) throw new Error("Necesitas iniciar sesión");
      const file: File | undefined = values.photo?.[0];
      if (!file) throw new Error("Debes subir una fotografía");

      // FAKE PROCESSING FOR DEMO/MVP VISUALS
      setProcessStage("upload"); setProcessProgress(20); await new Promise(r => setTimeout(r, 800));

      const sessionSeed = (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)).replace(/-/g, "").slice(0, 12);
      const ext = file.name.split(".").pop() || "jpg";
      const uid = user?.uid || "anonymous";
      const storagePath = `uploads/${uid}/${sessionSeed}/original.${ext}`;

      const storageRef = ref(getClientStorage(), storagePath);
      await uploadBytes(storageRef, file, { contentType: file.type || "image/jpeg" });

      setProcessStage("analyze"); setProcessProgress(50);

      const profile = { ...values, notes: values.notes || "" };
      const token = await getIdToken();

      // Get landing variant for analytics tracking
      const landingVariant = getStoredVariant();

      const createRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: values.email, input: profile, photoPath: storagePath, landingVariant }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok) throw new Error(createJson.error);
      const sessionId = createJson.sessionId as string;

      setProcessStage("render"); setProcessProgress(80);

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!analyzeRes.ok) {
        const analyzeJson = await analyzeRes.json();
        throw new Error(analyzeJson.error || "Fallo en el análisis de vectores");
      }

      setProcessStage("done"); setProcessProgress(100);
      router.push(`/loading/${sessionId}`);

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      addToast({ variant: "error", message: msg });
      setLoading(false);
      setProcessStage("idle");
    }
  };

  // --- RENDER STAGES ---

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#6D00FF]/30">

      {/* TOP HEADER */}
      <div className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center">
            <Activity size={18} className="text-[#6D00FF]" />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-widest text-white/50">Protocolo Elite</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">CALIBRACIÓN DE SISTEMA</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={cn("w-1.5 h-1.5 rounded-full transition-colors", currentStage >= s ? "bg-[#00FF94]" : "bg-white/10")} />
                ))}
              </div>
            </div>
          </div>
        </div>
        {DEMO && <div className="px-3 py-1 bg-[#6D00FF]/20 text-[#6D00FF] text-[10px] font-bold rounded-full border border-[#6D00FF]/30 backdrop-blur-md">DEMO MODE</div>}
      </div>

      {/* MAIN CONTENT AREA */}
      <form onSubmit={handleSubmit(onSubmit, onFormError)} className="min-h-screen flex flex-col pt-24 pb-24 px-6 max-w-5xl mx-auto">

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 max-w-md mx-auto text-center px-6">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-4 border-[#6D00FF]/20 rounded-full animate-spin-slow" />
              <div className="absolute inset-2 border-4 border-t-[#6D00FF] border-r-[#6D00FF] border-b-transparent border-l-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center font-black text-2xl italic text-[#6D00FF]">
                {processProgress}%
              </div>
            </div>

            <LoadingMessages stage={processStage} />

            <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3 text-left">
                <div className="mt-1 w-2 h-2 rounded-full bg-[#6D00FF] animate-pulse shrink-0" />
                <div className="space-y-1">
                  <p className="text-white font-bold text-xs uppercase tracking-wider">
                    Generando Proyecciones
                  </p>
                  <p className="text-neutral-400 text-[10px] leading-relaxed">
                    Estamos procesando 3 simulaciones de tu futuro físico (Mes 4, 8 y 12). Este proceso requiere alta potencia de cálculo y puede tomar unos momentos.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-neutral-600 text-[10px] uppercase tracking-widest mt-6 animate-pulse">
              No cierres esta ventana
            </p>
          </div>
        ) : (
          <>
            {/* STAGE 1: IDENTITY */}
            {currentStage === 1 && (
              <div className="flex items-center justify-center h-full animate-in slide-in-from-right-8 fade-in duration-500">
                <div className="w-full max-w-2xl text-center space-y-8">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-4 text-white">
                      SINCRONIZACIÓN <span className="text-[#6D00FF]">VISUAL</span>
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-md mx-auto leading-relaxed">
                      Sube una foto de cuerpo completo para establecer tu ancla biométrica inicial y confirma tu acceso.
                    </p>
                  </div>

                  <div className="max-w-md mx-auto w-full space-y-4">
                    <div className="relative">
                      <Input
                        {...register("email")}
                        placeholder="tu@email.com"
                        className="bg-white/5 border-white/10 rounded-xl py-6 pl-12 focus:border-[#6D00FF] transition-all"
                      />
                      <Eye className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                    </div>
                  </div>

                  <label
                    onDrop={onDrop}
                    onDragOver={onDrag}
                    onDragEnter={onDrag}
                    className={cn(
                      "group relative flex flex-col items-center justify-center w-full aspect-[4/3] md:aspect-[16/9] rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
                      previewUrl
                        ? "border-[#6D00FF] bg-[#6D00FF]/5"
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30"
                    )}
                  >
                    <input type="file" accept="image/*" className="hidden" {...register("photo")} ref={(el) => { inputRef.current = el; register("photo").ref(el); }} />

                    {previewUrl ? (
                      <>
                        <Image src={previewUrl} alt="Preview" fill className="object-contain p-4 z-10" />
                        <Image src={previewUrl} alt="Blur" fill className="object-cover blur-2xl opacity-20 z-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                        <div className="absolute bottom-6 z-20 flex items-center gap-2 bg-[#6D00FF] px-4 py-2 rounded-full shadow-[0_0_20px_#6D00FF]">
                          <Upload size={16} /> <span className="text-xs font-bold">CAMBIAR ARCHIVO</span>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4 group-hover:scale-105 transition-transform">
                        <div className="w-20 h-20 rounded-full bg-[#6D00FF]/10 flex items-center justify-center mx-auto border border-[#6D00FF]/30 shadow-[0_0_30px_rgba(109,0,255,0.2)]">
                          <Upload className="w-8 h-8 text-[#6D00FF]" />
                        </div>
                        <div>
                          <p className="font-bold text-white uppercase tracking-widest text-sm">Arrastra o Click</p>
                          <p className="text-neutral-500 text-xs mt-1">MAX 8MB • JPG/PNG</p>
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Consent Checkboxes */}
                  {previewUrl && (
                    <div className="space-y-3 text-left max-w-md mx-auto animate-in fade-in duration-300">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={consentTerms}
                          onChange={(e) => setConsentTerms(e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-[#6D00FF]"
                        />
                        <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors leading-relaxed">
                          Soy mayor de 18 años. He leído y acepto los{" "}
                          <a href="/terms" target="_blank" className="text-[#6D00FF] underline">Términos de Servicio</a>{" "}y el{" "}
                          <a href="/privacy" target="_blank" className="text-[#6D00FF] underline">Aviso de Privacidad</a>.
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={consentAI}
                          onChange={(e) => setConsentAI(e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-[#6D00FF]"
                        />
                        <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors leading-relaxed">
                          Autorizo que mi foto sea procesada por inteligencia artificial (Google Gemini) para generar imágenes de transformación proyectada. Mi foto será eliminada en un plazo máximo de 30 días.
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={consentEmail}
                          onChange={(e) => setConsentEmail(e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-[#6D00FF]"
                        />
                        <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors leading-relaxed">
                          Acepto recibir correos sobre mi transformación de NGX Transform. Puedo cancelar en cualquier momento.
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <Button
                      type="button"
                      onClick={nextStage}
                      disabled={!previewUrl || !allConsent}
                      className="px-12 py-6 rounded-full bg-white text-black hover:bg-neutral-200 font-black italic tracking-widest text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      INICIAR ESCANEO <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 2: BIOMETRICS */}
            {currentStage === 2 && (
              <div className="w-full max-w-4xl mx-auto animate-in slide-in-from-right-8 fade-in duration-500 space-y-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black italic tracking-tighter text-white">HARDWARE <span className="text-neutral-500">CORPOREAL</span></h2>
                  <p className="text-sm text-neutral-400 uppercase tracking-widest mt-2">Definiendo parámetros físicos base</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8 p-6 bg-white/5 rounded-3xl border border-white/10">
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
                      trackColor="blue"
                    />

                    <div className="pt-4 border-t border-white/5">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-3 block">Género Biológico</label>
                      <div className="flex gap-4">
                        {["male", "female"].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setValue("sex", s as any)}
                            className={cn(
                              "flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                              watch("sex") === s
                                ? "bg-white text-black border-white"
                                : "bg-white/5 text-neutral-500 border-white/10 hover:border-white/20"
                            )}
                          >
                            {s === "male" ? "Masculino" : "Femenino"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Tipo Somático</label>
                    <div className="grid grid-cols-1 gap-3">
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
                </div>
              </div>
            )}

            {/* STAGE 3: MISSION */}
            {currentStage === 3 && (
              <div className="w-full max-w-5xl mx-auto animate-in slide-in-from-right-8 fade-in duration-500 space-y-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black italic tracking-tighter text-white">OBJETIVO DE <span className="text-[#6D00FF]">MISIÓN</span></h2>
                  <p className="text-sm text-neutral-400 uppercase tracking-widest mt-2">Selecciona tu protocolo de transformación</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <EliteOptionCard
                    className="h-64 justify-end"
                    title="DEFINICIÓN EXTREMA"
                    description="Maximizar cortes musculares, reducir grasa corporal a un dígito. Look 'Shredded'."
                    selected={watch("goal") === "definicion"}
                    onClick={() => setValue("goal", "definicion")}
                    idx={1}
                  />
                  <EliteOptionCard
                    className="h-64 justify-end"
                    title="HIPERTROFIA MASIVA"
                    description="Volumen muscular máximo, densidad y tamaño. Look 'Mass Monster'."
                    selected={watch("goal") === "masa"}
                    onClick={() => setValue("goal", "masa")}
                    idx={2}
                  />
                  <EliteOptionCard
                    className="h-64 justify-end"
                    title="HÍBRIDO ATLÉTICO"
                    description="Balance perfecto entre rendimiento, estética y funcionalidad. Look 'Athlete'."
                    selected={watch("goal") === "mixto"}
                    onClick={() => setValue("goal", "mixto")}
                    idx={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-4 block">Nivel de Experiencia</label>
                    <div className="grid grid-cols-3 gap-2">
                      {([{ id: "novato", l: "Novato" }, { id: "intermedio", l: "Pro" }, { id: "avanzado", l: "Elite" }] as const).map((lv) => (
                        <button
                          key={lv.id}
                          type="button"
                          onClick={() => setValue("level", lv.id)}
                          className={cn(
                            "py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                            watch("level") === lv.id
                              ? "bg-white text-black border-white"
                              : "bg-white/5 text-neutral-500 border-white/10 hover:border-white/20"
                          )}
                        >
                          {lv.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-4 block">Días de Entrenamiento</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setValue("weeklyTime", d)}
                          className={cn(
                            "py-3 rounded-xl border text-xs font-black transition-all",
                            watch("weeklyTime") === d
                              ? "bg-white text-black border-white"
                              : "bg-white/5 text-neutral-500 border-white/10 hover:border-white/20"
                          )}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <div className="mb-6 flex justify-between items-center">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Zona de Enfoque Principal</label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {([
                      { id: "upper", l: "Tren Superior" }, { id: "lower", l: "Tren Inferior" },
                      { id: "abs", l: "Core & Abs" }, { id: "full", l: "Full Body" }
                    ] as const).map((z, i) => (
                      <div
                        key={z.id}
                        onClick={() => setValue("focusZone", z.id)}
                        className={cn(
                          "p-4 rounded-xl border text-center cursor-pointer transition-all hover:scale-105 active:scale-95",
                          watch("focusZone") === z.id
                            ? "bg-[#6D00FF] border-[#6D00FF] text-white shadow-[0_0_20px_#6D00FF]"
                            : "bg-black/40 border-white/10 text-neutral-400 hover:text-white"
                        )}
                      >
                        <div className="text-xs font-black uppercase tracking-widest">{z.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 4: SOFTWARE (MENTAL) */}
            {currentStage === 4 && (
              <div className="w-full max-w-3xl mx-auto animate-in slide-in-from-right-8 fade-in duration-500 flex flex-col items-center justify-center h-full">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-black italic tracking-tighter text-white">CALIBRACIÓN <span className="text-amber-500">MENTAL</span></h2>
                  <p className="text-sm text-neutral-400 uppercase tracking-widest mt-2 bg-amber-500/10 inline-block px-3 py-1 rounded text-amber-500 border border-amber-500/20">Ajuste de parámetros psicométricos</p>
                </div>

                <div className="w-full space-y-8 bg-black/40 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
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
                    trackColor="blue"
                  />
                  <CyberSlider
                    label="Carga de Estrés"
                    {...register("stressLevel")}
                    min={1} max={10}
                    valueDisplay={watch("stressLevel") + "/10"}
                    trackColor="red"
                  />
                </div>

                <div className="mt-12 w-full">
                  <Button
                    type="submit"
                    className="w-full py-8 text-xl font-black italic tracking-widest bg-[#6D00FF] hover:bg-[#5800cc] text-white rounded-2xl shadow-[0_0_40px_rgba(109,0,255,0.4)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    EJECUTAR SIMULACIÓN DE FUTURO
                  </Button>
                </div>
              </div>
            )}

            {/* NAVIGATION FOOTER */}
            {currentStage > 1 && (
              <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40 pointer-events-none">
                <div className="max-w-5xl mx-auto flex justify-between pointer-events-auto">
                  <button
                    type="button"
                    onClick={prevStage}
                    className="flex items-center gap-2 text-neutral-500 hover:text-white px-4 py-2 rounded-full hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-widest"
                  >
                    <ChevronLeft size={14} /> Anterior
                  </button>

                  {currentStage < 4 && (
                    <button
                      type="button"
                      onClick={nextStage}
                      className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full hover:scale-105 transition-transform text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                      Siguiente Fase <ChevronRight size={14} />
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
