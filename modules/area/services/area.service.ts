import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { Area, AreaPayload, Empresa, PaginatedResponse, Sucursal } from "../interfaces/area"
import { asArray } from "../utils/area"

type FetchAreasParams = {
  page?: number
  pageSize?: number
  empresa?: string
  sucursal?: string
  search?: string
}

function toPaginatedResponse<T>(payload: unknown): PaginatedResponse<T> {
  const data = payload as Partial<PaginatedResponse<T>>
  return {
    count: typeof data.count === "number" ? data.count : 0,
    next: typeof data.next === "string" ? data.next : null,
    previous: typeof data.previous === "string" ? data.previous : null,
    results: Array.isArray(data.results) ? (data.results as T[]) : [],
  }
}

export const fetchAreaCatalogs = async (token: string) => {
  const [e, s] = await Promise.all([
    authRequest(`${apiEndpoints.empresas}?page=1&page_size=200`, { token }),
    authRequest(`${apiEndpoints.sucursales}?page=1&page_size=500`, { token }),
  ])

  return {
    empresas: asArray<Empresa>(e),
    sucursales: asArray<Sucursal>(s),
  }
}

export const fetchAreas = async (token: string, params: FetchAreasParams) => {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.pageSize) query.set("page_size", String(params.pageSize))
  if (params.empresa?.trim()) query.set("empresa", params.empresa.trim())
  if (params.sucursal?.trim()) query.set("sucursal", params.sucursal.trim())
  if (params.search?.trim()) query.set("q", params.search.trim())
  const queryString = query.toString()
  const url = queryString ? `${apiEndpoints.areas}?${queryString}` : apiEndpoints.areas
  const response = await authRequest(url, { token })
  return toPaginatedResponse<Area>(response)
}

export const fetchAreaParents = async (token: string, sucursalId: string) => {
  if (!sucursalId) return []
  const response = await authRequest(`${apiEndpoints.areas}?sucursal=${sucursalId}&page=1&page_size=500`, { token })
  return toPaginatedResponse<Area>(response).results
}

export const createArea = (token: string, payload: AreaPayload) =>
  authRequest(apiEndpoints.areas, {
    method: "POST",
    body: payload,
    token,
  }) as Promise<Area>

export const updateArea = (token: string, id: number, payload: AreaPayload) =>
  authRequest(`${apiEndpoints.areas}${id}/`, {
    method: "PUT",
    body: payload,
    token,
  }) as Promise<Area>

export const deleteArea = (token: string, id: number) =>
  authRequest(`${apiEndpoints.areas}${id}/`, {
    method: "DELETE",
    token,
  })

