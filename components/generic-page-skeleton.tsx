import { Skeleton } from "@/components/ui/skeleton"

export function GenericPageSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[520px] overflow-auto">
        <table className="w-full min-w-[600px]">
          <thead className="sticky top-0 z-10 bg-slate-700 text-white">
            <tr>
              {Array.from({ length: 4 }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-20 bg-slate-500/40" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-20 bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-48 bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-32 bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg bg-slate-200/70" />
                    <Skeleton className="h-8 w-8 rounded-lg bg-slate-200/70" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
        <Skeleton className="h-5 w-36 bg-slate-200/70" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 bg-slate-200/70" />
          <Skeleton className="h-9 w-24 bg-slate-200/70" />
        </div>
      </div>
    </div>
  )
}

export function GenericPageLoadingLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-[calc(100vh-7rem)] bg-[radial-gradient(circle_at_top_right,#dcfce7_0%,#f8fafc_45%,#eef2ff_100%)] p-3 md:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <header className="rounded-2xl border border-white/50 bg-white/80 p-5 shadow-lg backdrop-blur md:p-6">
          <div className="space-y-3">
            <Skeleton className="h-7 w-56 bg-slate-200/70" />
            <Skeleton className="h-4 w-80 bg-slate-200/70" />
          </div>
        </header>
        {children}
      </div>
    </section>
  )
}
