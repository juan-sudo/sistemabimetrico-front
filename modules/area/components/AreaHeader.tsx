import { Building2, Download } from "lucide-react"
import type { Dispatch, FormEvent, SetStateAction } from "react"
import type { Area, FormState } from "../interfaces/area"
import AreaFormDialog from "./AreaFormDialog"

type Props = {
  open: boolean
  editingId: number | null
  saving: boolean
  form: FormState
  parentsDisponibles: Area[]
  setForm: Dispatch<SetStateAction<FormState>>
  onSubmit: (e: FormEvent) => Promise<void>
  onOpenChange: (next: boolean) => void
  onCreateNew: () => void
}

export default function AreaHeader(props: Props) {
  return (
    <header className="rounded-2xl border border-white/50 bg-white/80 p-5 shadow-lg backdrop-blur md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800 md:text-3xl">Gestion de Areas</h1>
            <p className="text-sm text-slate-500">Administra y organiza las areas institucionales.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50">
            <Download size={16} />
            Reporte
          </button>
          <AreaFormDialog {...props} />
        </div>
      </div>
    </header>
  )
}
