import { FileText } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import BoletaMensualPage from "../../../modules/boleta-mensual/components/BoletaMensualPage"

export default function Page() {
  return (
    <PageShell icon={<FileText size={22} />} title="Boleta de personal por mes" description="Genera y descarga boletas para el periodo seleccionado.">
      <BoletaMensualPage initialData={null} />
    </PageShell>
  )
}
