import { Building2 } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { EmpresaPageSkeleton } from "@/modules/empresa/components/EmpresaPageSkeleton"

export default function Loading() {
  return (
    <PageShell icon={<Building2 size={22} />} title="Lista de Empresas" description="Administra y organiza las empresas institucionales.">
      <div className="flex justify-end gap-2 rounded-2xl border border-slate-200/60 bg-white px-5 py-3 shadow-sm">
        <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-200/70" />
        <div className="h-9 w-36 animate-pulse rounded-lg bg-emerald-200/70" />
      </div>
      <EmpresaPageSkeleton />
    </PageShell>
  )
}
