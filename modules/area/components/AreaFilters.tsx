import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Empresa, Sucursal } from "../interfaces/area"

type Props = {
  empresaId: string
  sucursalId: string
  search: string
  empresas: Empresa[]
  sucursales: Sucursal[]
  onSearchChange: (value: string) => void
  onEmpresaChange: (id: string) => void
  onSucursalChange: (id: string) => void
}

export default function AreaFilters({
  empresaId,
  sucursalId,
  search,
  empresas,
  sucursales,
  onSearchChange,
  onEmpresaChange,
  onSucursalChange,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-slate-700">Buscar</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Codigo, area o tipo"
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-slate-700">Empresa</label>
        <select className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-700" value={empresaId} onChange={(e) => onEmpresaChange(e.target.value)}>
          <option value="">Todas</option>
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
          <option value="">Todas</option>
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
