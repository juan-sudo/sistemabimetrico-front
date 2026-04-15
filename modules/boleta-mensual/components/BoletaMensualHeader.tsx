import { CalendarDays, Download, FileText } from "lucide-react"

type Props = {
  generating: boolean
  hasSelection: boolean
  onGenerar: () => Promise<void>
  onPdf: () => Promise<void>
  onExcel: () => void
}

export default function BoletaMensualHeader({ generating, hasSelection, onGenerar, onPdf, onExcel }: Props) {
  return (
    <header className="rounded-2xl border border-white/50 bg-white/80 p-5 shadow-lg backdrop-blur md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800 md:text-3xl">Boleta de personal por mes</h1>
            <p className="text-sm text-slate-500">Genera y descarga boletas para el periodo seleccionado.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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
      </div>
    </header>
  )
}
