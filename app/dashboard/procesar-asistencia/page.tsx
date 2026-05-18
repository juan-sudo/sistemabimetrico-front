import { Cog } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import ProcesarAsistenciaPage from "../../../modules/procesar-asistencia/components/ProcesarAsistenciaPage"

export default function Page() {
  return (
    <PageShell icon={<Cog size={22} />} title="Procesar asistencia" description="Genera el resumen mensual de asistencia y llena las tablas del reporte.">
      <ProcesarAsistenciaPage />
    </PageShell>
  )
}
