import { UsersRound } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { TipoTrabajadorPageSkeleton } from "@/modules/tipotrabajador/components/TipoTrabajadorPageSkeleton"

export default function Loading() {
  return (
    <PageShell icon={<UsersRound size={22} />} title="Lista de tipos de trabajadores" description="Administra y organiza los tipos de trabajadores.">
      <TipoTrabajadorPageSkeleton />
    </PageShell>
  )
}
