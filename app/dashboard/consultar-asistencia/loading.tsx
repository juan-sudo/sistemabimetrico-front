import { FileSearch } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { GenericPageSkeleton } from "@/components/generic-page-skeleton"

export default function Loading() {
  return (
    <PageShell
      icon={<FileSearch size={22} />}
      title="Consultar asistencia"
      description="Vista completa de asistencia con todas las columnas."
      maxWidth="max-w-[1800px]"
      headerClassName="rounded-2xl border border-slate-700/70 bg-gradient-to-r from-[#081428] via-[#0b1730] to-[#0e1d3a] p-5 shadow-lg md:p-6"
      titleClassName="text-2xl font-semibold tracking-tight text-slate-100 md:text-3xl"
      descriptionClassName="text-sm text-slate-300"
    >
      <GenericPageSkeleton rows={10} />
    </PageShell>
  )
}
