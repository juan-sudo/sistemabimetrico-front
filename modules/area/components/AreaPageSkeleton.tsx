import { Skeleton } from "@/components/ui/skeleton"

export function AreaPageSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[460px] overflow-auto">
        <table className="w-full min-w-[900px]">
          <thead className="sticky top-0 z-10 bg-teal-700 text-white">
            <tr className="text-sm">
              <th className="px-4 py-3 text-left font-semibold">Codigo</th>
              <th className="px-4 py-3 text-left font-semibold">Area</th>
              <th className="px-4 py-3 text-left font-semibold">Tipo</th>
              <th className="px-4 py-3 text-left font-semibold">Depende de</th>
              <th className="px-4 py-3 text-center font-semibold">Editar</th>
              <th className="px-4 py-3 text-center font-semibold">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, index) => (
              <tr key={`area-skeleton-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-16 bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-52 bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-24 bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-40 bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3 text-center"><Skeleton className="mx-auto h-8 w-8 rounded-lg bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3 text-center"><Skeleton className="mx-auto h-8 w-8 rounded-lg bg-slate-200/70" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
