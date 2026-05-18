import { ShieldCheck } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { GenericPageSkeleton } from "@/components/generic-page-skeleton"

export default function Loading() {
  return (
    <PageShell icon={<ShieldCheck size={22} />} title="Usuarios y permisos" description="Administra usuarios y sus permisos de acceso.">
      <GenericPageSkeleton rows={8} />
    </PageShell>
  )
}
