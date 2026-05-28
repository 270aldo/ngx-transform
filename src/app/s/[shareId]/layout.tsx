/**
 * Layout específico para páginas de resultados /s/[shareId]
 * No incluye el header global - usa su propio header (NGX VISION)
 */
export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ngx-landing-shell relative min-h-screen overflow-x-hidden selection:bg-[#6D00FF] selection:text-white">
      {children}
    </div>
  );
}
