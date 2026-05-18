import { FileText } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { GenericPageSkeleton } from "@/components/generic-page-skeleton"

export default function Loading() {
  return (
    <PageShell icon={<FileText size={22} />} title="Descansos Medicos y Subsidios" description="Registra y gestiona descansos medicos del personal." maxWidth="max-w-7xl">
      <GenericPageSkeleton rows={8} />
    </PageShell>
  )
}
