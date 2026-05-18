import { FileText } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { GenericPageSkeleton } from "@/components/generic-page-skeleton"

export default function Loading() {
  return (
    <PageShell icon={<FileText size={22} />} title="Boleta de personal por mes" description="Consulta y exporta boletas mensuales del personal.">
      <GenericPageSkeleton rows={8} />
    </PageShell>
  )
}
