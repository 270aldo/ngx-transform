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
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
}
