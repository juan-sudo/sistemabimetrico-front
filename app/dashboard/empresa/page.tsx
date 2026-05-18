import { Building2 } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import EmpresaPage from "../../../modules/empresa/components/EmpresaPage"

export default function Page() {
  return (
    <PageShell
      icon={<Building2 size={22} />}
      title="Lista de Empresas"
      description="Administra y organiza las empresas institucionales."
    >
      <EmpresaPage />
    </PageShell>
  )
}
