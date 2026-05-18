import { Clock3 } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import TurnoPage from "../../../modules/turno/components/TurnoPage"

export default function Page() {
  return (
    <PageShell icon={<Clock3 size={22} />} title="Lista de Turnos" description="Administra y organiza los turnos institucionales.">
      <TurnoPage />
    </PageShell>
  )
}
