import { Clock3 } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { TurnoPageSkeleton } from "@/modules/turno/components/TurnoPageSkeleton"

export default function Loading() {
  return (
    <PageShell icon={<Clock3 size={22} />} title="Lista de Turnos" description="Administra y organiza los turnos de trabajo.">
      <TurnoPageSkeleton />
    </PageShell>
  )
}
