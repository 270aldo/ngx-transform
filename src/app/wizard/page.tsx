"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getClientAuth, getClientStorage } from "@/lib/firebaseClient";
import { signInAnonymously } from "firebase/auth";
import { ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { Progress } from "@/components/shadcn/ui/progress";
import { Spinner } from "@/components/Spinner";
import { useToast } from "@/components/ui/toast-provider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/shadcn/ui/select";
import { Stepper } from "@/components/Stepper";
import { Card } from "@/components/shadcn/ui/card";

const FormSchema = z.object({
  email: z.string().email(),
  age: z.coerce.number().int().min(13).max(100),
  sex: z.enum(["male", "female", "other"]),
  heightCm: z.coerce.number().min(100).max(250),
  weightKg: z.coerce.number().min(30).max(300),
  level: z.enum(["novato", "intermedio", "avanzado"]),
  goal: z.enum(["definicion", "masa", "mixto"]),
  weeklyTime: z.coerce.number().min(1).max(14),
  stressLevel: z.coerce.number().min(1).max(10).default(5),
  sleepQuality: z.coerce.number().min(1).max(10).default(5),
  disciplineRating: z.coerce.number().min(1).max(10).default(5),
  bodyType: z.enum(["ectomorph", "mesomorph", "endomorph"]).default("mesomorph"),
  specificGoals: z.array(z.string()).default([]),
  focusZone: z.enum(["upper", "lower", "abs", "full"]).default("full"),
  notes: z.string().optional(),
  photo: z.any(),
});

type FormValues = z.infer<typeof FormSchema>;

export const dynamic = "force-dynamic";

export default function WizardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "lead" | "upload" | "create" | "analyze" | "images" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const { addToast } = useToast();
  const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<FormValues>({
    // Type cast for resolver to avoid strict generic mismatch; acceptable for MVP
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(FormSchema) as any,
    defaultValues: {
      sex: "male",
      level: "novato",
      goal: "definicion",
      weeklyTime: 3,
      stressLevel: 5,
      sleepQuality: 5,
      disciplineRating: 5,
      bodyType: "mesomorph",
    },
  });

  const photoReg = register("photo");

  useEffect(() => {
    if (!DEMO) {
      // Only si NO es demo, autenticamos para Storage
      signInAnonymously(getClientAuth()).catch(() => { });
    }
  }, [DEMO]);

  // ----------
  // UI: Dropzone simple y consistente
  // ----------
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
  const onDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      setError(null);
      const file: File | undefined = values.photo?.[0];
      if (!file) throw new Error("Debes subir una fotografía");
      if (file.size > 8 * 1024 * 1024) throw new Error("La fotografía supera 8MB. Por favor, usa una imagen más ligera.");

      if (DEMO) {
        // Simulación en modo demo (sin APIs)
        setStage("lead"); setProgress(12); await new Promise(r => setTimeout(r, 400));
        setStage("upload"); setProgress(36); await new Promise(r => setTimeout(r, 500));
        setStage("create"); setProgress(58); await new Promise(r => setTimeout(r, 450));
        setStage("analyze"); setProgress(79); await new Promise(r => setTimeout(r, 650));
        setStage("images"); setProgress(90); await new Promise(r => setTimeout(r, 350));
        setStage("done"); setProgress(100);
        router.push("/demo/result");
        return;
      }

      // Flujo real (cuando desactivemos DEMO)
      // 1) Lead capture
      setStage("lead"); setProgress(10);
      const leadRes = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, consent: true, source: "wizard" }),
      });
      if (!leadRes.ok) {
        const j = await leadRes.json().catch(() => ({}));
        throw new Error(j.error || "No se pudo registrar el lead");
      }

      // 2) Upload photo
      const sessionSeed = (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)).replace(/-/g, "").slice(0, 12);
      const ext = file.name.split(".").pop() || "jpg";
      const storagePath = `uploads/${sessionSeed}/original.${ext}`;

      setStage("upload"); setProgress(30);
      const storageRef = ref(getClientStorage(), storagePath);
      await uploadBytes(storageRef, file, { contentType: file.type || "image/jpeg" });

      // 3) Create session
      const profile = {
        age: values.age,
        sex: values.sex,
        heightCm: values.heightCm,
        weightKg: values.weightKg,
        level: values.level,
        goal: values.goal,
        weeklyTime: values.weeklyTime,
        stressLevel: values.stressLevel,
        sleepQuality: values.sleepQuality,
        disciplineRating: values.disciplineRating,
        bodyType: values.bodyType,
        specificGoals: values.specificGoals,
        notes: values.notes,
      };
      setStage("create"); setProgress(50);
      const createRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, input: profile, photoPath: storagePath }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok) throw new Error(createJson.error || "No se pudo crear la sesión");
      const sessionId = createJson.sessionId as string;

      // 4) Analyze
      setStage("analyze"); setProgress(75);
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const analyzeJson = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeJson.error || "Error al analizar la imagen");

      // 5) Images (async)
      setStage("images"); setProgress(85);
      fetch("/api/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).catch(() => { });

      setStage("done"); setProgress(100);
      router.push(`/s/${sessionId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      addToast({ variant: "error", message });
    } finally {
      setLoading(false);
    }
  };

  const photoFile = watch("photo");
  const previewUrl = photoFile && photoFile[0] ? URL.createObjectURL(photoFile[0]) : null;
  const emailVal = watch("email");
  const stepCurrent: 1 | 2 | 3 = emailVal ? (photoFile && photoFile.length ? 3 : 2) : 1;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Generar resultados</h1>
            <p className="text-neutral-400">Sube tu foto, completa tus datos y visualiza la proyección 0/4/8/12 meses.</p>
          </div>
          {DEMO && (
            <span className="px-3 py-1 rounded bg-[#6D00FF]/20 text-[#B98CFF] border border-[#6D00FF]/30 text-xs">Modo demo</span>
          )}
        </div>

        <Card className="p-6">
          <Stepper current={stepCurrent} />
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Columna Foto */}
            <div className="space-y-3 lg:col-span-4 h-full">
              <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5 h-full flex flex-col">
                <h3 className="text-sm font-bold text-[#6D00FF] uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#6D00FF]"></span>
                  Fotografía
                </h3>
                <Label className="sr-only">Fotografía</Label>
                <label
                  onDrop={onDrop}
                  onDragOver={onDrag}
                  onDragEnter={onDrag}
                  className="relative flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-card/60 border-border transition cursor-pointer hover:bg-card/80 hover:shadow-[0_0_24px_rgba(109,0,255,0.25)] hover:border-primary/50 min-h-[300px]"
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...photoReg}
                    ref={(el) => { inputRef.current = el; photoReg.ref(el); }}
                  />
                  {!previewUrl ? (
                    <div className="text-center px-4">
                      <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="block w-5 h-5 rounded-full bg-primary" />
                      </div>
                      <p className="font-medium">Arrastra tu foto o haz clic</p>
                      <p className="text-muted-foreground text-sm">JPG/PNG, máx 8MB. Enfoque frontal, buena luz.</p>
                    </div>
                  ) : (
                    <Image src={previewUrl} alt="preview" fill unoptimized className="object-cover rounded-lg" />
                  )}
                </label>
                <p className="text-xs text-neutral-500 mt-3 text-center">Sugerencia: ilumina bien el rostro y evita filtros.</p>
              </div>
            </div>

            {/* 2-Column Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:col-span-8">

              {/* LEFT COLUMN: IDENTITY & BIO */}
              <div className="space-y-6 h-full">
                <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5 space-y-6 h-full">
                  <h3 className="text-sm font-bold text-[#6D00FF] uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#6D00FF]"></span>
                    1. Identidad & Biometría
                  </h3>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="tu@email" {...register("email")} className="bg-black/40 border-white/10 focus:border-[#6D00FF]" />
                    {errors.email && <p className="text-red-400 text-sm">{String(errors.email.message)}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Edad</Label>
                      <Input type="number" {...register("age")} className="bg-black/40 border-white/10 focus:border-[#6D00FF]" />
                    </div>
                    <div>
                      <Label>Sexo</Label>
                      <Select value={watch("sex")} onValueChange={(v) => setValue("sex", v as FormValues["sex"])}>
                        <SelectTrigger className="w-full bg-black/40 border-white/10 focus:border-[#6D00FF]">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="female">Femenino</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Altura (cm)</Label>
                      <Input type="number" {...register("heightCm")} className="bg-black/40 border-white/10 focus:border-[#6D00FF]" />
                    </div>
                    <div>
                      <Label>Peso (kg)</Label>
                      <Input type="number" {...register("weightKg")} className="bg-black/40 border-white/10 focus:border-[#6D00FF]" />
                    </div>
                  </div>

                  {/* Body Type Selector */}
                  <div className="space-y-2">
                    <Label>Tipo de Cuerpo</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["ectomorph", "mesomorph", "endomorph"] as const).map((type) => (
                        <div
                          key={type}
                          onClick={() => setValue("bodyType", type)}
                          className={`cursor-pointer rounded-lg border p-2 text-center transition-all ${watch("bodyType") === type
                            ? "bg-[#6D00FF]/20 border-[#6D00FF] text-white shadow-[0_0_15px_rgba(109,0,255,0.3)]"
                            : "bg-black/40 border-white/5 text-neutral-500 hover:border-white/20"
                            }`}
                        >
                          <div className="text-[10px] font-bold uppercase mb-1 tracking-wider truncate">{type}</div>
                          <div className="text-[9px] opacity-60 leading-tight">
                            {type === "ectomorph" && "Estructura ligera"}
                            {type === "mesomorph" && "Atlético natural"}
                            {type === "endomorph" && "Estructura sólida"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Focus Zone Selector */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <Label className="flex items-center gap-2">
                      <span className="text-[#6D00FF]">✦</span>
                      Zona de Enfoque
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { id: "upper" as const, label: "Tren Superior", sub: "Pecho, Hombros, Brazos" },
                        { id: "lower" as const, label: "Tren Inferior", sub: "Piernas, Glúteos, Potencia" },
                        { id: "abs" as const, label: "Core & Abs", sub: "Definición, Cintura, V-Taper" },
                        { id: "full" as const, label: "Full Body", sub: "Proporción, Estética Total" }
                      ]).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setValue("focusZone", item.id)}
                          className={`cursor-pointer rounded-lg border p-2 text-center transition-all ${watch("focusZone") === item.id
                            ? "bg-[#6D00FF]/20 border-[#6D00FF] text-white shadow-[0_0_15px_rgba(109,0,255,0.3)]"
                            : "bg-black/40 border-white/5 text-neutral-500 hover:border-white/20"
                            }`}
                        >
                          <div className="text-[10px] font-bold uppercase mb-0.5 tracking-wider">{item.label}</div>
                          <div className="text-[8px] opacity-60 leading-tight">{item.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: GOALS & MIND */}
              <div className="space-y-6 h-full">
                <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5 space-y-6 h-full">
                  <h3 className="text-sm font-bold text-[#6D00FF] uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#6D00FF]"></span>
                    2. Estrategia & Mentalidad
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nivel Actual</Label>
                      <Select value={watch("level")} onValueChange={(v) => setValue("level", v as FormValues["level"])}>
                        <SelectTrigger className="w-full bg-black/40 border-white/10 focus:border-[#6D00FF]">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="novato">Novato</SelectItem>
                          <SelectItem value="intermedio">Intermedio</SelectItem>
                          <SelectItem value="avanzado">Avanzado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Objetivo Principal</Label>
                      <Select value={watch("goal")} onValueChange={(v) => setValue("goal", v as FormValues["goal"])}>
                        <SelectTrigger className="w-full bg-black/40 border-white/10 focus:border-[#6D00FF]">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="definicion">Definición</SelectItem>
                          <SelectItem value="masa">Masa</SelectItem>
                          <SelectItem value="mixto">Mixto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <Label>Dedicatoria Semanal</Label>
                      <span className="text-[#6D00FF] font-bold">{watch("weeklyTime")}h</span>
                    </div>
                    <input
                      type="range"
                      min="1" max="14"
                      className="w-full accent-[#6D00FF] h-2 bg-black/40 rounded-lg appearance-none cursor-pointer"
                      {...register("weeklyTime")}
                    />
                  </div>

                  {/* Mental Logs */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <Label>Nivel de Estrés</Label>
                        <span className="text-red-400 font-bold">{watch("stressLevel")}/10</span>
                      </div>
                      <input
                        type="range" min="1" max="10"
                        className="w-full accent-red-500 h-2 bg-black/40 rounded-lg appearance-none cursor-pointer"
                        {...register("stressLevel")}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <Label>Calidad de Sueño</Label>
                        <span className="text-blue-400 font-bold">{watch("sleepQuality")}/10</span>
                      </div>
                      <input
                        type="range" min="1" max="10"
                        className="w-full accent-blue-500 h-2 bg-black/40 rounded-lg appearance-none cursor-pointer"
                        {...register("sleepQuality")}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <Label>Disciplina</Label>
                        <span className="text-green-400 font-bold">{watch("disciplineRating")}/10</span>
                      </div>
                      <input
                        type="range" min="1" max="10"
                        className="w-full accent-green-500 h-2 bg-black/40 rounded-lg appearance-none cursor-pointer"
                        {...register("disciplineRating")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notas del Coach</Label>
                    <Textarea rows={2} placeholder="Lesiones, equipo, preferencias..." {...register("notes")} className="bg-black/40 border-white/10 focus:border-[#6D00FF]" />
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION AREA */}
            <div className="mt-8 space-y-4 lg:col-span-12 flex flex-col items-center">
              {error && <div className="p-3 border border-red-500/40 text-red-300 bg-red-500/10 rounded text-sm text-center">{error}</div>}

              {loading && (
                <div className="space-y-2 p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-3 text-neutral-300 text-sm font-medium">
                    <Spinner />
                    <span className="animate-pulse">
                      {stage === "lead" && "INICIANDO PROTOCOLO..."}
                      {stage === "upload" && "DIGITALIZANDO BIOMETRÍA..."}
                      {stage === "create" && "ESTRUCTURANDO SESIÓN..."}
                      {stage === "analyze" && "ANALIZANDO VECTORES..."}
                      {stage === "images" && "RENDERIZANDO FUTURO..."}
                      {stage === "done" && "TRANSFORMACIÓN COMPLETA."}
                    </span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>
              )}

              <Button disabled={loading} className="w-full max-w-2xl h-14 text-lg bg-[#6D00FF] hover:bg-[#5b00d6] text-white font-bold tracking-[0.2em] shadow-[0_0_30px_rgba(109,0,255,0.4)] transition-all hover:scale-[1.01]">
                {loading ? "PROCESANDO..." : (DEMO ? "VER DEMO" : "INICIAR TRANSFORMACIÓN")}
              </Button>
              <p className="text-[10px] text-neutral-600 text-center uppercase tracking-widest">Datos encriptados. Uso exclusivo de NGX.</p>
            </div>
          </form >
        </Card >
      </div >
    </div >
  );
}
