import { FileText } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import JustificacionPage from "../../../modules/justificacion/components/JustificacionPage"

export default function Page() {
  return (
    <PageShell icon={<FileText size={22} />} title="Registrar justificacion" description="Registra y gestiona justificaciones del personal.">
      <JustificacionPage />
    </PageShell>
  )
}
