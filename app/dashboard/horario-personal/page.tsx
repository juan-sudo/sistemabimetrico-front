import { CalendarClock } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import HorarioPersonalPage from "../../../modules/horario-personal/components/HorarioPersonalPage"

export default function Page() {
  return (
    <PageShell icon={<CalendarClock size={22} />} title="Horario por personal" description="Asigna a cada trabajador un turno con su hora de entrada y salida." maxWidth="max-w-7xl">
      <HorarioPersonalPage />
    </PageShell>
  )
}
