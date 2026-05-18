import { Cable } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { DispositivosPageSkeleton } from "@/modules/dispositivos/components/DispositivosPageSkeleton"

export default function Loading() {
  return (
    <PageShell icon={<Cable size={22} />} title="Lista de Dispositivos" description="Administra y gestiona los dispositivos biometricos.">
      <DispositivosPageSkeleton />
    </PageShell>
  )
}
