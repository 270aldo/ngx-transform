import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";
import { GlobalHeader } from "@/components/GlobalHeader";
import { DM_Sans, Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { BackgroundEffects } from "@/components/ui/BackgroundEffects";
import { MotionPreferences } from "@/components/MotionPreferences";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.VERCEL_URL ||
  "http://localhost:3000";
const metadataBase = new URL(String(baseUrl).startsWith("http") ? baseUrl : `https://${baseUrl}`);

export const metadata: Metadata = {
  title: "NGX Transform — Diagnóstico visual de salud muscular",
  description: "Sube una foto y recibe una visualización aspiracional, lectura muscular inicial y dirección de 12 semanas hacia HYBRID. No es garantía ni diagnóstico médico.",
  metadataBase,
  openGraph: {
    title: "NGX Transform — Diagnóstico visual de salud muscular",
    description: "Visualización aspiracional, lectura muscular inicial y dirección de 12 semanas hacia HYBRID. No es garantía ni diagnóstico médico.",
    siteName: "NGX Transform",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "NGX Transform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NGX Transform — Diagnóstico visual de salud muscular",
    description: "Visualización aspiracional, lectura muscular inicial y dirección de 12 semanas hacia HYBRID. No es garantía ni diagnóstico médico.",
    images: ["/og-default.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#6D00FF",
  // Extend under the notch/home-indicator so `env(safe-area-inset-*)` is
  // non-zero on iPhone; fixed/sticky chrome uses it below to avoid overlap.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-background text-foreground">
        <BackgroundEffects />
        <MotionPreferences>
        <AuthProvider>
          <ToastProvider>
            <div className="relative z-50">
              <GlobalHeader />
            </div>
            <main className="relative z-10">
              {children}
            </main>
          </ToastProvider>
        </AuthProvider>
        </MotionPreferences>
      </body>
    </html>
  );
}
