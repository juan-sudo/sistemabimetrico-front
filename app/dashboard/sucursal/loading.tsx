import { Building2 } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { SucursalPageSkeleton } from "@/modules/sucursal/components/SucursalPageSkeleton"

export default function Loading() {
  return (
    <PageShell icon={<Building2 size={22} />} title="Lista de Sucursales" description="Administra y organiza las sucursales institucionales.">
      <SucursalPageSkeleton />
    </PageShell>
  )
}
