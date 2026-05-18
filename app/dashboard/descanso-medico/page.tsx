import { FileText } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import DescansoMedicoPage from "@/modules/descanso-medico/components/DescansoMedicoPage"

export default function Page() {
  return (
    <PageShell icon={<FileText size={22} />} title="Descansos Medicos y Subsidios" description="Registra y gestiona descansos medicos del personal." maxWidth="max-w-7xl">
      <DescansoMedicoPage />
    </PageShell>
  )
}
