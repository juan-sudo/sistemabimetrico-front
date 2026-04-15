"use client"

import Link from "next/link"
import { BackButton } from "@/components/ui/BackButton"
import { UsuarioContainer } from "@/components/licencias/UsuarioContainer"
import { LicenciasCard } from "@/components/licencias/LicenciasCard"
import { useGestionarUsuarioPage } from "../hooks/useGestionarUsuarioPage"
import { buscarUsuarioRoute } from "../utils/gestionarusuario.utils"

export default function GestionarUsuarioPage() {
  const { usuarios, licencias } = useGestionarUsuarioPage()

  return (
    <div className="w-full space-y-6 p-1 md:px-4 md:py-6">
      <Link href={buscarUsuarioRoute}>
        <BackButton className="px-3 py-1.5 text-sm" />
      </Link>

      <UsuarioContainer data={usuarios} />
      <LicenciasCard licencias={licencias} />
    </div>
  )
}
