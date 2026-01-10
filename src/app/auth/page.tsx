"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebaseClient";
import { Card } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-provider";
import { useAuth } from "@/components/auth/AuthProvider";

type Mode = "login" | "register";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nextUrl = useMemo(() => {
    const next = searchParams?.get("next");
    return next && next.startsWith("/") ? next : "/wizard";
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      router.push(nextUrl);
    }
  }, [loading, user, router, nextUrl]);

  const handleEmailAuth = async () => {
    try {
      setSubmitting(true);
      const auth = getClientAuth();
      if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push(nextUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo autenticar";
      addToast({ variant: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setSubmitting(true);
      const auth = getClientAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push(nextUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo iniciar con Google";
      addToast({ variant: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-6 space-y-6 glass-panel rounded-2xl">
        <header className="space-y-2">
          <p className="text-xs tracking-[0.35em] uppercase text-[#6D00FF]">NGX ACCESS</p>
          <h1 className="text-2xl font-semibold">
            {mode === "register" ? "Crear cuenta" : "Iniciar sesión"}
          </h1>
          <p className="text-sm text-neutral-400">
            Accede para generar tu transformación y ver tu dashboard privado.
          </p>
        </header>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label>Contraseña</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleEmailAuth}
            disabled={submitting || !email || password.length < 6}
          >
            {mode === "register" ? "Crear cuenta" : "Entrar"}
          </Button>

          <Button
            variant="outline"
            className="w-full border-white/10"
            onClick={handleGoogle}
            disabled={submitting}
          >
            Continuar con Google
          </Button>

          <div className="text-xs text-neutral-400 text-center">
            {mode === "register" ? (
              <span>
                ¿Ya tienes cuenta?{" "}
                <button
                  className="text-[#6D00FF] hover:text-[#B98CFF] transition"
                  onClick={() => setMode("login")}
                  type="button"
                >
                  Inicia sesión
                </button>
              </span>
            ) : (
              <span>
                ¿Nuevo en NGX?{" "}
                <button
                  className="text-[#6D00FF] hover:text-[#B98CFF] transition"
                  onClick={() => setMode("register")}
                  type="button"
                >
                  Crear cuenta
                </button>
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#6D00FF] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
