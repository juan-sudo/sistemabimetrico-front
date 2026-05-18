import { BriefcaseBusiness } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { CargoPageSkeleton } from "@/modules/cargo/components/CargoPageSkeleton"

export default function Loading() {
  return (
    <PageShell icon={<BriefcaseBusiness size={22} />} title="Lista de Cargos" description="Administra y organiza los cargos institucionales.">
      <CargoPageSkeleton />
    </PageShell>
  )
}
