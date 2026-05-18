import { BriefcaseBusiness } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import CargoPage from "../../../modules/cargo/components/CargoPage"

export default function Page() {
  return (
    <PageShell icon={<BriefcaseBusiness size={22} />} title="Lista de Cargos" description="Administra y organiza los cargos institucionales.">
      <CargoPage />
    </PageShell>
  )
}
