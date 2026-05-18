export default function DescargarMarcasPageSkeleton() {
  return (
    <section className="min-h-[calc(100vh-7rem)] bg-[radial-gradient(circle_at_top_right,#dcfce7_0%,#f8fafc_45%,#eef2ff_100%)] p-3 md:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <div className="animate-pulse rounded-2xl border border-white/50 bg-white/80 p-5 shadow-lg md:p-6">
          <div className="h-8 w-64 rounded-md bg-slate-200" />
          <div className="mt-3 h-4 w-96 max-w-full rounded-md bg-slate-100" />
        </div>

        <div className="animate-pulse rounded-xl border border-slate-300 bg-white p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="h-10 w-72 rounded-md bg-slate-100" />
            <div className="h-10 w-40 rounded-md bg-slate-100" />
            <div className="h-10 w-40 rounded-md bg-slate-100" />
            <div className="h-10 w-44 rounded-md bg-slate-100" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-11 rounded-md bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
