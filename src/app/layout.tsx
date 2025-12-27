import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";
import { GlobalHeader } from "@/components/GlobalHeader";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

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
    <html lang="es" className={spaceGrotesk.variable}>
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
