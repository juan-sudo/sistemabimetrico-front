import { Skeleton } from "@/components/ui/skeleton"

type EmpresaPageSkeletonProps = {
  rows?: number
}

export function EmpresaPageSkeleton({ rows = 8 }: EmpresaPageSkeletonProps) {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full min-w-[980px]">
            <thead className="sticky top-0 z-10 bg-teal-700 text-white">
              <tr className="text-sm">
                <th className="px-4 py-3 text-left font-semibold">Codigo</th>
                <th className="px-4 py-3 text-left font-semibold">Logo</th>
                <th className="px-4 py-3 text-left font-semibold">Razon Social</th>
                <th className="px-4 py-3 text-left font-semibold">RUC</th>
                <th className="px-4 py-3 text-left font-semibold">Correo</th>
                <th className="px-4 py-3 text-center font-semibold">Editar</th>
                <th className="px-4 py-3 text-center font-semibold">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, index) => (
                <tr key={`empresa-skeleton-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-14 bg-slate-200/70" /></td>
                  <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-16 bg-slate-200/70" /></td>
                  <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-56 bg-slate-200/70" /></td>
                  <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-28 bg-slate-200/70" /></td>
                  <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-48 bg-slate-200/70" /></td>
                  <td className="border-t border-slate-200 px-4 py-3 text-center"><Skeleton className="mx-auto h-8 w-8 rounded-lg bg-slate-200/70" /></td>
                  <td className="border-t border-slate-200 px-4 py-3 text-center"><Skeleton className="mx-auto h-8 w-8 rounded-lg bg-slate-200/70" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Skeleton className="h-5 w-36 bg-slate-200/70" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 bg-slate-200/70" />
          <Skeleton className="h-9 w-24 bg-slate-200/70" />
        </div>
      </div>
    </div>
  )
}
