import { Cable } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import DispositivosPage from "../../../modules/dispositivos/components/DispositivosPage"

export default function Page() {
  return (
    <PageShell icon={<Cable size={22} />} title="Lista de Dispositivos" description="Lista de equipos de marcacion y estado de conectividad.">
      <DispositivosPage />
    </PageShell>
  )
}
