import { Download } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import DescargarMarcasPage from "../../../modules/descargar-marcas/components/DescargarMarcasPage"

export default function Page() {
  return (
    <PageShell icon={<Download size={22} />} title="Descargar Marcaciones" description="Descarga y registra marcaciones desde dispositivos biometricos en modo solo lectura.">
      <DescargarMarcasPage />
    </PageShell>
  )
}
