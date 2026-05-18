import { Building2 } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import AreaPage from "../../../modules/area/components/AreaPage"

export default function Page() {
  return (
    <PageShell icon={<Building2 size={22} />} title="Gestion de Areas" description="Administra y organiza las areas institucionales.">
      <AreaPage />
    </PageShell>
  )
}
