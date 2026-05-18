import { ShieldCheck } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { SindicatoPageSkeleton } from "@/modules/sindicato/components/SindicatoPageSkeleton"

export default function Loading() {
  return (
    <PageShell icon={<ShieldCheck size={22} />} title="Lista de sindicatos" description="Administra y organiza los sindicatos del personal.">
      <SindicatoPageSkeleton />
    </PageShell>
  )
}
