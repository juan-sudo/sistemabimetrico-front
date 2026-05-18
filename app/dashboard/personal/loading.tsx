import { UsersRound } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { GenericPageSkeleton } from "@/components/generic-page-skeleton"

export default function Loading() {
  return (
    <PageShell icon={<UsersRound size={22} />} title="Mantenimiento de Personal" description="Administra y gestiona el personal de la institucion.">
      <GenericPageSkeleton rows={10} />
    </PageShell>
  )
}
