import { Building2 } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { AreaPageSkeleton } from "@/modules/area/components/AreaPageSkeleton"

export default function Loading() {
  return (
    <PageShell icon={<Building2 size={22} />} title="Gestion de Areas" description="Administra y organiza las areas institucionales.">
      <AreaPageSkeleton />
    </PageShell>
  )
}
