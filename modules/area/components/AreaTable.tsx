import { Pencil, Trash2 } from "lucide-react"
import type { Area } from "../interfaces/area"
import { tipoLabel } from "../utils/area"

type Props = {
  loading: boolean
  areas: Area[]
  areaById: Record<number, Area>
  onEdit: (item: Area) => void
  onDelete: (item: Area) => Promise<void>
}

export default function AreaTable({ loading, areas, areaById, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[460px] overflow-auto">
        <table className="w-full min-w-[900px]">
          <thead className="sticky top-0 z-10 bg-teal-700 text-white">
            <tr className="text-sm">
              <th className="w-24 px-4 py-3 text-left font-semibold">Codigo</th>
              <th className="px-4 py-3 text-left font-semibold">Area</th>
              <th className="w-36 px-4 py-3 text-left font-semibold">Tipo</th>
              <th className="px-4 py-3 text-left font-semibold">Depende de</th>
              <th className="w-24 px-4 py-3 text-center font-semibold">Editar</th>
              <th className="w-24 px-4 py-3 text-center font-semibold">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                  Cargando areas...
                </td>
              </tr>
            ) : areas.length === 0 ? (
              <tr>
                <td colSpan={6} className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                  No hay registros.
                </td>
              </tr>
            ) : (
              areas.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.codigo}</td>
                  <td className="border-t border-slate-200 px-4 py-3 font-medium text-slate-700">{item.nombre}</td>
                  <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{tipoLabel[item.tipo]}</td>
                  <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.parent ? areaById[item.parent]?.nombre || "-" : "-"}</td>
                  <td className="border-t border-slate-200 px-4 py-3 text-center">
                    <button onClick={() => onEdit(item)} className="inline-flex rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-600 transition hover:bg-amber-100">
                      <Pencil size={16} />
                    </button>
                  </td>
                  <td className="border-t border-slate-200 px-4 py-3 text-center">
                    <button onClick={() => onDelete(item)} className="inline-flex rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
