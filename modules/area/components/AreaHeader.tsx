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
    <div className="flex flex-wrap justify-end gap-2 rounded-2xl border border-white/50 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
      <button className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50">
        <Download size={16} />
        Reporte
      </button>
      <AreaFormDialog {...props} />
    </div>
  )
}
