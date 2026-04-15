import type { Empresa, Sucursal } from "../interfaces/area"

type Props = {
  empresaId: string
  sucursalId: string
  empresas: Empresa[]
  sucursales: Sucursal[]
  onEmpresaChange: (id: string) => void
  onSucursalChange: (id: string) => void
}

export default function AreaFilters({ empresaId, sucursalId, empresas, sucursales, onEmpresaChange, onSucursalChange }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-slate-700">Empresa</label>
        <select className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-700" value={empresaId} onChange={(e) => onEmpresaChange(e.target.value)}>
          {empresas.map((x) => (
            <option key={x.id} value={x.id}>
              {x.razon_social}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-slate-700">Sucursal</label>
        <select className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-700" value={sucursalId} onChange={(e) => onSucursalChange(e.target.value)}>
          {sucursales.map((x) => (
            <option key={x.id} value={x.id}>
              {x.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
