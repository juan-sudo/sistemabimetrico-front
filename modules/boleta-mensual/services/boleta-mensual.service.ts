import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { Area, Boleta, Personal, TipoTrabajador } from "../interfaces/boleta-mensual"
import { asArray } from "../utils/boleta-mensual"

const CACHE_STATIC_MS = 5 * 60 * 1000
const CACHE_DYNAMIC_MS = 30 * 1000

export const fetchBaseData = async (token: string) => {
  const [p, a, t] = await Promise.all([
    authRequest(apiEndpoints.personales, { token, cacheMs: CACHE_DYNAMIC_MS }),
    authRequest(apiEndpoints.areas, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.tiposTrabajador, { token, cacheMs: CACHE_STATIC_MS }),
  ])

  return {
    personales: asArray<Personal>(p),
    areas: asArray<Area>(a),
    tiposTrabajador: asArray<TipoTrabajador>(t),
  }
}

export const fetchBoletas = async (token: string, year: string, month: string) => {
  const data = await authRequest(`${apiEndpoints.boletasMensuales}?anio=${year}&mes=${Number(month)}`, { token, cacheMs: CACHE_DYNAMIC_MS })
  return asArray<Boleta>(data)
}

export const generarBoletas = async (token: string, year: string, month: string, personalIds: number[]) => {
  return authRequest(`${apiEndpoints.boletasMensuales}generar/`, {
    method: "POST",
    body: {
      anio: Number(year),
      mes: Number(month),
      personal_ids: personalIds,
      sueldo_base: 0,
    },
    token,
  }) as Promise<{ creados?: number; existentes?: number }>
}

export const fetchResumenPlanilla = async (token: string, personalId: number, year: string, month: string) => {
  return authRequest(`${apiEndpoints.personales}${personalId}/resumen-planilla/?anio=${year}&mes=${Number(month)}`, { token, cacheMs: CACHE_DYNAMIC_MS })
}
