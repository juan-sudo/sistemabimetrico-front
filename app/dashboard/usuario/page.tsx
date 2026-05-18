import { ShieldCheck } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import UsuarioPage from "../../../modules/usuario/components/UsuarioPage"

export default function Page() {
  return (
    <PageShell icon={<ShieldCheck size={22} />} title="Usuarios y permisos" description="Administra accesos, activacion y permisos por modulo para cada usuario.">
      <UsuarioPage />
    </PageShell>
  )
}
