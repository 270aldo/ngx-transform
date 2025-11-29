import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";
import { GlobalHeader } from "@/components/GlobalHeader";
import { Inter } from "next/font/google";

const sans = Inter({ subsets: ["latin"], variable: "--font-ngx-sans" });
const display = Inter({ subsets: ["latin"], variable: "--font-ngx-display" });

export const metadata: Metadata = {
  title: "NGX Transform",
  description: "Visual fitness premium by NGX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body className={`antialiased bg-background text-foreground scroll-smooth`}>
        <ToastProvider>
          <GlobalHeader />
          <main>
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
