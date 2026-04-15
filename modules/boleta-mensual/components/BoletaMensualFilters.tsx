import { Search } from "lucide-react"
import { getYearOptions, monthOptions } from "../utils/boleta-mensual"

type Props = {
  month: string
  year: string
  search: string
  onMonthChange: (value: string) => void
  onYearChange: (value: string) => void
  onSearchChange: (value: string) => void
}

export default function BoletaMensualFilters({ month, year, search, onMonthChange, onYearChange, onSearchChange }: Props) {
  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Mes</label>
        <select className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={month} onChange={(e) => onMonthChange(e.target.value)}>
          {monthOptions.map((x) => (
            <option key={x.value} value={x.value}>
              {x.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Año</label>
        <select className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={year} onChange={(e) => onYearChange(e.target.value)}>
          {getYearOptions().map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="text-sm font-medium text-slate-700">Buscar personal</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input className="h-10 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm" value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Buscar por nombre, documento o area" />
        </div>
      </div>
    </div>
  )
}
