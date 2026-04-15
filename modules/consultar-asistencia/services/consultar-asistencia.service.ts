import { apiEndpoints, authRequest } from "@/lib/api-client"

const CACHE_STATIC_MS = 5 * 60 * 1000
const CACHE_DYNAMIC_MS = 30 * 1000

export async function fetchPersonales(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.personales, { token, cacheMs: CACHE_DYNAMIC_MS })
}

export async function fetchAreas(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.areas, { token, cacheMs: CACHE_STATIC_MS })
}

export async function fetchPersonalTurnos(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.personalTurnos, { token, cacheMs: CACHE_DYNAMIC_MS })
}

export async function fetchTurnos(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.turnos, { token, cacheMs: CACHE_STATIC_MS })
}

export async function fetchTurnoBloques(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.turnoBloquesHorario, { token, cacheMs: CACHE_STATIC_MS })
}

export async function fetchMarcaciones(token: string, fechaInicio: string, fechaFin: string, personalId: number | null): Promise<unknown> {
  const params = new URLSearchParams()
  params.set("fecha_inicio", fechaInicio)
  params.set("fecha_fin", fechaFin)
  if (personalId) params.set("personal", String(personalId))

  return authRequest(`${apiEndpoints.marcaciones}?${params.toString()}`, { token, cacheMs: CACHE_DYNAMIC_MS })
}
