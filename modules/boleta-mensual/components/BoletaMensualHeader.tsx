import { CalendarDays, Download } from "lucide-react"

type Props = {
  generating: boolean
  hasSelection: boolean
  onGenerar: () => Promise<void>
  onPdf: () => Promise<void>
  onExcel: () => void
}

export default function BoletaMensualHeader({ generating, hasSelection, onGenerar, onPdf, onExcel }: Props) {
  return (
    <div className="flex flex-wrap justify-end gap-2 rounded-2xl border border-white/50 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
      <button
        onClick={onGenerar}
        className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!hasSelection || generating}
      >
        <CalendarDays size={16} />
        {generating ? "Generando..." : "Generar boletas"}
      </button>
      <button
        onClick={onPdf}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!hasSelection}
      >
        <Download size={16} />
        Descargar PDF
      </button>
      <button
        onClick={onExcel}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!hasSelection}
      >
        <Download size={16} />
        Descargar Excel
      </button>
    </div>
  )
}
