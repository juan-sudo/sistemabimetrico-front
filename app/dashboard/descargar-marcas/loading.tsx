import { Download } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { GenericPageSkeleton } from "@/components/generic-page-skeleton"

export default function Loading() {
  return (
    <PageShell icon={<Download size={22} />} title="Descargar Marcaciones" description="Descarga las marcaciones de los dispositivos biometricos.">
      <GenericPageSkeleton rows={8} />
    </PageShell>
  )
}
