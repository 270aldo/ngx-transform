"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  notes: z.string().optional(),
  photo: z.any(),
});

type FormValues = z.infer<typeof FormSchema>;

export const dynamic = "force-dynamic";

export default function WizardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle"|"lead"|"upload"|"create"|"analyze"|"images"|"done">("idle");
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
    },
  });

  const photoReg = register("photo");

  useEffect(() => {
    if (!DEMO) {
      // Only si NO es demo, autenticamos para Storage
      signInAnonymously(getClientAuth()).catch(() => {});
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
        setStage("lead"); setProgress(12); await new Promise(r=>setTimeout(r, 400));
        setStage("upload"); setProgress(36); await new Promise(r=>setTimeout(r, 500));
        setStage("create"); setProgress(58); await new Promise(r=>setTimeout(r, 450));
        setStage("analyze"); setProgress(79); await new Promise(r=>setTimeout(r, 650));
        setStage("images"); setProgress(90); await new Promise(r=>setTimeout(r, 350));
        setStage("done"); setProgress(100);
        router.push("/demo/result");
        return;
      }

      // Flujo real (cuando desactivemos DEMO)
      // 1) Lead capture
      setStage("lead"); setProgress(10);
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, consent: true, source: "wizard" }),
      });

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
      }).catch(() => {});

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
      <div className="max-w-5xl mx-auto p-6">
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
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna Foto */}
            <div className="space-y-3">
              <Label>Fotografía</Label>
              <label
                onDrop={onDrop}
                onDragOver={onDrag}
                onDragEnter={onDrag}
                className="relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl aspect-[4/5] bg-card/60 border-border transition cursor-pointer hover:bg-card/80 hover:shadow-[0_0_24px_rgba(109,0,255,0.25)] hover:border-primary/50"
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
              <p className="text-xs text-neutral-500">Sugerencia: ilumina bien el rostro y evita filtros.</p>
            </div>

            {/* Columna Formulario */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input placeholder="tu@email" {...register("email")}/>
                {errors.email && <p className="text-red-400 text-sm">{String(errors.email.message)}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Edad</Label>
                  <Input type="number" {...register("age")}/>
                </div>
                <div>
                  <Label>Sexo</Label>
                  <Select value={watch("sex")} onValueChange={(v) => setValue("sex", v as FormValues["sex"])}>
                    <SelectTrigger className="w-full">
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
                  <Input type="number" {...register("heightCm")}/>
                </div>
                <div>
                  <Label>Peso (kg)</Label>
                  <Input type="number" {...register("weightKg")}/>
                </div>
                <div>
                  <Label>Nivel</Label>
                  <Select value={watch("level")} onValueChange={(v) => setValue("level", v as FormValues["level"])}>
                    <SelectTrigger className="w-full">
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
                  <Label>Objetivo</Label>
                  <Select value={watch("goal")} onValueChange={(v) => setValue("goal", v as FormValues["goal"])}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="definicion">Definición</SelectItem>
                      <SelectItem value="masa">Masa</SelectItem>
                      <SelectItem value="mixto">Mixto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Horas/semana</Label>
                  <Input type="number" {...register("weeklyTime")}/>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea rows={4} placeholder="Objetivos, lesiones, preferencias..." {...register("notes")} />
              </div>

              {error && <div className="p-3 border border-red-500/40 text-red-300 bg-red-500/10 rounded text-sm">{error}</div>}

              {loading && (
                <div className="space-y-2 p-3 rounded bg-neutral-900 border border-neutral-800">
                  <div className="flex items-center gap-2 text-neutral-300 text-sm">
                    <Spinner />
                    <span>
                      {stage === "lead" && "Registrando lead..."}
                      {stage === "upload" && "Subiendo fotografía..."}
                      {stage === "create" && "Creando sesión..."}
                      {stage === "analyze" && "Analizando..."}
                      {stage === "images" && "Preparando visuales..."}
                      {stage === "done" && "Completado."}
                    </span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button disabled={loading}>
                  {loading ? (
                    <span className="inline-flex items-center gap-2"><Spinner /> Procesando...</span>
                  ) : (
                    DEMO ? "Ver demo con mi foto" : "Generar resultados"
                  )}
                </Button>
                <Button type="button" variant="secondary" onClick={() => router.push("/demo/result")}>Ver demo rápida</Button>
              </div>
              <p className="text-xs text-neutral-500">Privado. No es consejo médico.</p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
