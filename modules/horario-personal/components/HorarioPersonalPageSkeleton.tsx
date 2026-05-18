import { Skeleton } from "@/components/ui/skeleton"

export function HorarioPersonalPageSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[560px] overflow-auto">
        <table className="w-full min-w-[1280px]">
          <thead className="sticky top-0 z-10 bg-teal-700 text-white">
            <tr className="text-sm">
              <th className="px-4 py-3 text-left font-semibold">Sucursal</th>
              <th className="px-4 py-3 text-left font-semibold">Area</th>
              <th className="px-4 py-3 text-left font-semibold">Numero de documento</th>
              <th className="px-4 py-3 text-left font-semibold">Nombres completos</th>
              <th className="px-4 py-3 text-left font-semibold">Turno</th>
              <th className="px-4 py-3 text-left font-semibold">Horario</th>
              <th className="px-4 py-3 text-left font-semibold">Fecha inicio</th>
              <th className="px-4 py-3 text-left font-semibold">Fecha fin</th>
              <th className="px-4 py-3 text-left font-semibold">Horario entrada</th>
              <th className="px-4 py-3 text-left font-semibold">Horario salida</th>
              <th className="px-4 py-3 text-center font-semibold">Editar</th>
              <th className="px-4 py-3 text-center font-semibold">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, index) => (
              <tr key={`horario-personal-skeleton-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-24 bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-24 bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-28 bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-56 bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-32 bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-40 bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-24 bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-24 bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-28 bg-slate-200/70" /></td>
                <td className="border-t border-slate-200 px-4 py-3"><Skeleton className="h-4 w-28 bg-slate-200/70" /></td>
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
