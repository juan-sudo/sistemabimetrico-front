import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { Empresa, PaginatedResponse, Sucursal } from "../interfaces/sucursal.interface"

type FetchSucursalesParams = {
  page?: number
  pageSize?: number
  search?: string
  empresa?: string
  activo?: string
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

export async function fetchEmpresasForSucursal(token: string): Promise<Empresa[]> {
  const payload = await authRequest(`${apiEndpoints.empresas}?page=1&page_size=200`, { token })
  return toPaginatedResponse<Empresa>(payload).results
}

export async function fetchSucursales(
  token: string,
  params: FetchSucursalesParams
): Promise<PaginatedResponse<Sucursal>> {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.pageSize) query.set("page_size", String(params.pageSize))
  if (params.search?.trim()) query.set("q", params.search.trim())
  if (params.empresa?.trim()) query.set("empresa", params.empresa.trim())
  if (params.activo?.trim()) query.set("activo", params.activo.trim())
  const queryString = query.toString()
  const url = queryString ? `${apiEndpoints.sucursales}?${queryString}` : apiEndpoints.sucursales
  const payload = await authRequest(url, { token })
  return toPaginatedResponse<Sucursal>(payload)
}

export async function createSucursal(
  token: string,
  payload: { empresa: number; codigo: string; nombre: string; activo: boolean }
): Promise<Sucursal> {
  return authRequest(apiEndpoints.sucursales, {
    method: "POST",
    body: payload,
    token,
  }) as Promise<Sucursal>
}

export async function updateSucursal(
  id: number,
  token: string,
  payload: { empresa: number; codigo: string; nombre: string; activo: boolean }
): Promise<Sucursal> {
  return authRequest(`${apiEndpoints.sucursales}${id}/`, {
    method: "PUT",
    body: payload,
    token,
  }) as Promise<Sucursal>
}

export async function deleteSucursal(id: number, token: string): Promise<void> {
  await authRequest(`${apiEndpoints.sucursales}${id}/`, { method: "DELETE", token })
}

