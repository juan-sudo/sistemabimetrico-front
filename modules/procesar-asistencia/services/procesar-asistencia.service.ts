import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { Catalog, Dispositivo, PaginatedResponse, Personal } from "../interfaces/procesar-asistencia.interface"

const CACHE_STATIC_MS = 5 * 60 * 1000
const CACHE_DYNAMIC_MS = 30 * 1000

const toArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === "object" && Array.isArray((value as { results?: unknown[] }).results)) {
    return (value as { results: T[] }).results
  }
  return []
}

type FetchPersonalesPageParams = {
  search: string
}

const emptyPaginated = <T>(): PaginatedResponse<T> => ({
  count: 0,
  next: null,
  previous: null,
  results: [],
})

export async function fetchProcesarAsistenciaCatalogs(token: string): Promise<[Catalog[], Catalog[], Catalog[]]> {
  return Promise.all([
    authRequest(apiEndpoints.empresas, { token, cacheMs: CACHE_STATIC_MS }).then((x) => toArray<Catalog>(x)),
    authRequest(apiEndpoints.sucursales, { token, cacheMs: CACHE_STATIC_MS }).then((x) => toArray<Catalog>(x)),
    authRequest(apiEndpoints.areas, { token, cacheMs: CACHE_STATIC_MS }).then((x) => toArray<Catalog>(x)),
  ])
}

export async function fetchPersonalesProcesarPage(token: string, params: FetchPersonalesPageParams): Promise<PaginatedResponse<Personal>> {
  const query = new URLSearchParams()
  query.set("paginated", "0")
  query.set("lite", "1")
  if (params.search.trim()) query.set("search", params.search.trim())

  const response = await authRequest(`${apiEndpoints.personales}?${query.toString()}`, { token, cacheMs: CACHE_DYNAMIC_MS })

  if (Array.isArray(response)) {
    return {
      count: response.length,
      next: null,
      previous: null,
      results: response as Personal[],
    }
  }

  const data = response as Partial<PaginatedResponse<Personal>>
  return {
    count: typeof data.count === "number" ? data.count : Array.isArray(data.results) ? data.results.length : 0,
    next: typeof data.next === "string" ? data.next : null,
    previous: typeof data.previous === "string" ? data.previous : null,
    results: Array.isArray(data.results) ? data.results : [],
  }
}

export async function fetchAllDispositivosActivosIds(token: string): Promise<number[]> {
  const pageSize = 50
  const ids: number[] = []
  const maxPages = 100

  for (let page = 1; page <= maxPages; page += 1) {
    const query = new URLSearchParams()
    query.set("page", String(page))
    query.set("page_size", String(pageSize))
    query.set("activo", "1")

    const response = await authRequest(`${apiEndpoints.dispositivos}?${query.toString()}`, { token, cacheMs: CACHE_DYNAMIC_MS })
    const data = response as Partial<PaginatedResponse<Dispositivo>>
    const rows = Array.isArray(data.results) ? data.results : emptyPaginated<Dispositivo>().results

    rows.forEach((item) => {
      if (typeof item?.id === "number") ids.push(item.id)
    })

    if (!data.next) break
  }

  return ids
}

export async function descargarMarcacionesDispositivos(token: string, dispositivoIds: number[]): Promise<unknown> {
  return authRequest(`${apiEndpoints.descargasMarcaciones}descargar-dispositivo/`, {
    method: "POST",
    body: {
      dispositivo_ids: dispositivoIds,
      clave_comunicacion: 0,
    },
    token,
  })
}

export async function generarReporteGeneral(token: string, personalId: number, anio: string, mes: string): Promise<unknown> {
  return authRequest(`${apiEndpoints.personales}${personalId}/reporte-general/?anio=${anio}&mes=${mes}`, { token })
}
