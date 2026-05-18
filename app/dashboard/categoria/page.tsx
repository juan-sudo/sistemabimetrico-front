import { FolderTree } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import CategoriaPage from "../../../modules/categoria/components/CategoriaPage"

export default function Page() {
  return (
    <PageShell icon={<FolderTree size={22} />} title="Categorias" description="Administra y organiza las categorias institucionales.">
      <CategoriaPage />
    </PageShell>
  )
}
