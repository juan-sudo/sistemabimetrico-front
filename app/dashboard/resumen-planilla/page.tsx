import { FileText } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import ResumenPlanillaPage from "../../../modules/resumen-planilla/components/ResumenPlanillaPage"

export default function Page() {
  return (
    <PageShell icon={<FileText size={22} />} title="Resumen" description="Consulta el consolidado mensual de un trabajador para generar su boleta.">
      <ResumenPlanillaPage />
    </PageShell>
  )
}
