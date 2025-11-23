import Link from "next/link";
export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="section-hero relative max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
              <span className="text-gradient">NGX Transform</span>
              <br/>
              Visual fitness premium
            </h1>
            <p className="text-neutral-300 mt-4 text-base md:text-lg max-w-xl">
              Sube tu foto y recibe un análisis profesional con proyección realista a 4/8/12 meses.
              Insight preciso con Gemini + visuales generados con NanoBanana.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/wizard" className="inline-flex bg-[#6D00FF] text-white rounded-md px-5 py-2.5 font-medium hover:brightness-110">Probar gratis →</Link>
              <Link href="/demo/result" className="inline-flex bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-md px-5 py-2.5 font-medium hover:bg-neutral-800">Ver demo</Link>
            </div>
            <p className="text-xs text-neutral-500 mt-3">Gratis. Resultados en segundos. No es consejo médico.</p>
          </div>
          <div className="hidden md:block">
            <div className="card p-4">
              <div className="rounded-md border border-neutral-800 p-3 bg-neutral-950">
                <div className="h-5 w-24 bg-[#6D00FF]/20 rounded" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 bg-neutral-800 rounded w-5/6" />
                  <div className="h-3 bg-neutral-800 rounded w-4/6" />
                  <div className="h-3 bg-neutral-800 rounded w-3/6" />
                </div>
                <div className="hr-soft my-4" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-40 bg-neutral-900 rounded" />
                  <div className="space-y-2">
                    <div className="h-3 bg-neutral-800 rounded w-4/5" />
                    <div className="h-3 bg-neutral-800 rounded w-3/5" />
                    <div className="h-3 bg-neutral-800 rounded w-2/5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Premium", desc: "UI minimal y moderna" },
            { title: "Privado", desc: "Tus datos bajo control" },
            { title: "Rápido", desc: "Resultados en segundos" },
          ].map((f) => (
            <div key={f.title} className="card p-5">
              <h3 className="font-medium">{f.title}</h3>
              <p className="text-neutral-400 text-sm mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
