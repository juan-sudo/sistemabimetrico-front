import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { Area, FiltroEstado, Justificacion, Sucursal } from "../interfaces/autorizar-justificacion.interface"
import { asList, getMonthIndex } from "../utils/autorizar-justificacion.utils"

const CACHE_STATIC_MS = 5 * 60 * 1000
const CACHE_DYNAMIC_MS = 30 * 1000

type FetchRowsParams = {
  sucursal: string
  area: string
  mes: string
  anio: string
  filtroEstado: FiltroEstado
}

export async function fetchAutorizarJustificacionCatalogs(token: string): Promise<[Sucursal[], Area[]]> {
  return Promise.all([
    authRequest(apiEndpoints.sucursales, { token, cacheMs: CACHE_STATIC_MS }).then((value) => asList<Sucursal>(value)),
    authRequest(apiEndpoints.areas, { token, cacheMs: CACHE_STATIC_MS }).then((value) => asList<Area>(value)),
  ])
}

export async function fetchAutorizarJustificaciones(token: string, params: FetchRowsParams): Promise<Justificacion[]> {
  const query = new URLSearchParams()
  query.set("lite", "1")
  if (params.sucursal) query.set("sucursal", params.sucursal)
  if (params.area) query.set("area", params.area)
  if (params.mes) query.set("mes", String(getMonthIndex(params.mes)))
  if (params.anio) query.set("anio", params.anio)
  if (params.filtroEstado !== "TODOS") query.set("estado", params.filtroEstado)

  const response = await authRequest(`${apiEndpoints.justificaciones}?${query.toString()}`, {
    token,
    cacheMs: CACHE_DYNAMIC_MS,
  })

  return asList<Justificacion>(response)
}

export async function gestionarJustificaciones(
  token: string,
  body: { ids: number[]; accion: "AUTORIZAR" | "NO_AUTORIZAR"; motivo: string }
) {
  return authRequest(`${apiEndpoints.justificaciones}gestionar/`, {
    method: "POST",
    body,
    token,
  })
}
