import { UsersRound } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import TipoTrabajadorPage from "../../../modules/tipotrabajador/components/TipoTrabajadorPage"

export default function Page() {
  return (
    <PageShell icon={<UsersRound size={22} />} title="Lista de tipos de trabajadores" description="Administra y organiza las categorias de trabajadores.">
      <TipoTrabajadorPage />
    </PageShell>
  )
}
