import { FileText } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { GenericPageSkeleton } from "@/components/generic-page-skeleton"

export default function Loading() {
  return (
    <PageShell icon={<FileText size={22} />} title="Resumen" description="Resumen de planilla del personal por periodo.">
      <GenericPageSkeleton rows={8} />
    </PageShell>
  )
}
