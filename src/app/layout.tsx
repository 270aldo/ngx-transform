import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";
import { GlobalHeader } from "@/components/GlobalHeader";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { BackgroundEffects } from "@/components/ui/BackgroundEffects";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
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
  title: "NGX Transform",
  description: "Visual fitness premium by NGX",
  metadataBase,
  openGraph: {
    title: "NGX Transform",
    description: "Visual fitness premium by NGX",
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
    title: "NGX Transform",
    description: "Visual fitness premium by NGX",
    images: ["/og-default.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#6D00FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-background text-foreground">
        <BackgroundEffects />
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
      </body>
    </html>
  );
}
