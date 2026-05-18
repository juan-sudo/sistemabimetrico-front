import { Cog } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { GenericPageSkeleton } from "@/components/generic-page-skeleton"

export default function Loading() {
  return (
    <PageShell icon={<Cog size={22} />} title="Procesar asistencia" description="Procesa y calcula la asistencia del personal.">
      <GenericPageSkeleton rows={8} />
    </PageShell>
  )
}
