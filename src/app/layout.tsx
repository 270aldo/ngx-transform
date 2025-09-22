import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";
import Link from "next/link";
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
          <header className="border-b border-border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <Link href="/" className="font-semibold">NGX Transform</Link>
              <nav className="flex items-center gap-3">
                <Link className="text-sm text-muted-foreground hover:text-foreground" href="/wizard">Probar</Link>
                <a className="text-sm text-muted-foreground hover:text-foreground" href="#">Contacto</a>
              </nav>
            </div>
          </header>
          <main>
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
