import { CalendarClock } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { HorarioPersonalPageSkeleton } from "@/modules/horario-personal/components/HorarioPersonalPageSkeleton"

export default function Loading() {
  return (
    <PageShell icon={<CalendarClock size={22} />} title="Horario por personal" description="Asigna y gestiona los horarios del personal." maxWidth="max-w-7xl">
      <HorarioPersonalPageSkeleton />
    </PageShell>
  )
}
