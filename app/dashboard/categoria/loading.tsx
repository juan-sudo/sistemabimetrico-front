import { FolderTree } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { CategoriaPageSkeleton } from "@/modules/categoria/components/CategoriaPageSkeleton"

export default function Loading() {
  return (
    <PageShell icon={<FolderTree size={22} />} title="Categorias" description="Administra y organiza las categorias del personal.">
      <CategoriaPageSkeleton />
    </PageShell>
  )
}
