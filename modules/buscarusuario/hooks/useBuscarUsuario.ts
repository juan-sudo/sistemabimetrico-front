"use client"

import { useMemo, useState } from "react"
import type { BuscarUsuarioFiltros } from "../interfaces/buscar-usuario.interface"
import { getUsuariosMock } from "../services/buscar-usuario.service"
import { filtrarUsuarios } from "../utils/buscar-usuario.utils"

export function useBuscarUsuario() {
  const [filtros, setFiltros] = useState<BuscarUsuarioFiltros>({
    codigo: "",
    dni: "",
    nombres: "",
  })

  const data = useMemo(() => getUsuariosMock(), [])
  const filteredData = useMemo(() => filtrarUsuarios(data, filtros), [data, filtros])

  const setCodigo = (codigo: string) => setFiltros((prev) => ({ ...prev, codigo }))
  const setDni = (dni: string) => setFiltros((prev) => ({ ...prev, dni }))
  const setNombres = (nombres: string) => setFiltros((prev) => ({ ...prev, nombres }))

  return {
    filtros,
    filteredData,
    setCodigo,
    setDni,
    setNombres,
  }
}
