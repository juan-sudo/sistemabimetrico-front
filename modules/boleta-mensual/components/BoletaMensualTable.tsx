import type { Dispatch, SetStateAction } from "react"
import type { PersonalBoleta } from "../interfaces/boleta-mensual"

type Props = {
  loading: boolean
  rows: PersonalBoleta[]
  selected: Record<number, boolean>
  selectedCount: number
  currency: Intl.NumberFormat
  onToggleAllVisible: (checked: boolean) => void
  setSelected: Dispatch<SetStateAction<Record<number, boolean>>>
}

export default function BoletaMensualTable({ loading, rows, selected, selectedCount, currency, onToggleAllVisible, setSelected }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[560px] overflow-auto">
        <table className="w-full min-w-[900px]">
          <thead className="sticky top-0 z-10 bg-teal-700 text-white">
            <tr className="text-sm">
              <th className="w-14 px-4 py-3 text-center">
                <input type="checkbox" checked={rows.length > 0 && selectedCount === rows.length} onChange={(e) => onToggleAllVisible(e.target.checked)} aria-label="Seleccionar todos" />
              </th>
              <th className="w-44 px-4 py-3 text-left font-semibold">Documento</th>
              <th className="px-4 py-3 text-left font-semibold">Nombres completos</th>
              <th className="w-40 px-4 py-3 text-left font-semibold">Area</th>
              <th className="w-40 px-4 py-3 text-left font-semibold">Tipo trabajador</th>
              <th className="w-40 px-4 py-3 text-right font-semibold">Sueldo base</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="border-t border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                  Cargando personal...
                </td>
              </tr>
            ) : (
              rows.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="border-t border-slate-200 px-4 py-3 text-center">
                    <input type="checkbox" checked={!!selected[item.id]} onChange={(e) => setSelected((prev) => ({ ...prev, [item.id]: e.target.checked }))} aria-label={`Seleccionar ${item.nombres}`} />
                  </td>
                  <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.documento}</td>
                  <td className="border-t border-slate-200 px-4 py-3 font-medium text-slate-700">{item.nombres}</td>
                  <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.area}</td>
                  <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.tipoTrabajador}</td>
                  <td className="border-t border-slate-200 px-4 py-3 text-right text-slate-700">{currency.format(item.sueldoBase)}</td>
                </tr>
              ))
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="border-t border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                  No se encontraron registros con el filtro aplicado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
