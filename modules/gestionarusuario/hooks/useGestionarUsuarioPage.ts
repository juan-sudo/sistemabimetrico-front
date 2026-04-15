"use client"

import { useMemo } from "react"
import { getGestionarUsuarioMockData } from "../services/gestionarusuario.service"

export function useGestionarUsuarioPage() {
  const data = useMemo(() => getGestionarUsuarioMockData(), [])

  return {
    usuarios: data.usuarios,
    licencias: data.licencias,
  }
}
