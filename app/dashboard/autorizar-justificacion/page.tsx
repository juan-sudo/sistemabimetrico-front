import { FileText } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import AutorizarJustificacionPage from "@/modules/autorizar-justificacion/components/AutorizarJustificacionPage"

export default function Page() {
  return (
    <PageShell icon={<FileText size={22} />} title="Autorizacion de Justificacion" description="Gestiona y autoriza justificaciones del personal." maxWidth="max-w-7xl">
      <AutorizarJustificacionPage />
    </PageShell>
  )
}
