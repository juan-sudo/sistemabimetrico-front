import { ShieldCheck } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import SindicatoPage from "../../../modules/sindicato/components/SindicatoPage"

export default function Page() {
  return (
    <PageShell icon={<ShieldCheck size={22} />} title="Lista de sindicatos" description="Administra los tipos de sindicato del sistema.">
      <SindicatoPage />
    </PageShell>
  )
}
