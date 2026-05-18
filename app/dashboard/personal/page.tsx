import { UsersRound } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import PersonalPage from "../../../modules/personal/components/PersonalPage"

export default function Page() {
  return (
    <PageShell icon={<UsersRound size={22} />} title="Mantenimiento de Personal" description="Completa datos laborales, contacto, cargo y direccion.">
      <PersonalPage />
    </PageShell>
  )
}
