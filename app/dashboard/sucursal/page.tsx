import { Building2 } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { SucursalClient } from "./SucursalClient"

export default function Page() {
  return (
    <PageShell icon={<Building2 size={22} />} title="Lista de Sucursales" description="Administra sucursales por empresa, estado y codigo institucional.">
      <SucursalClient />
    </PageShell>
  )
}
