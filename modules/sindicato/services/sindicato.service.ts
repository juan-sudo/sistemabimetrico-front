import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { TipoSindicato, TipoSindicatoListResponse } from "../interfaces/sindicato.interface"

type FetchTiposSindicatoParams = {
  page?: number
  pageSize?: number
  search?: string
  estado?: string
}

export async function fetchTiposSindicato(
  token: string,
  params?: FetchTiposSindicatoParams
): Promise<TipoSindicatoListResponse> {
  const query = new URLSearchParams()
  if (params?.page) query.set("page", String(params.page))
  if (params?.pageSize) query.set("page_size", String(params.pageSize))
  if (params?.search?.trim()) query.set("q", params.search.trim())
  if (params?.estado === "ACTIVO") query.set("activo", "true")
  if (params?.estado === "INACTIVO") query.set("activo", "false")
  const url = query.size > 0 ? `${apiEndpoints.tiposSindicato}?${query.toString()}` : apiEndpoints.tiposSindicato
  const response = await authRequest(url, { token })
  const data = response as Partial<TipoSindicatoListResponse>
  return {
    count: typeof data.count === "number" ? data.count : 0,
    next: typeof data.next === "string" ? data.next : null,
    previous: typeof data.previous === "string" ? data.previous : null,
    results: Array.isArray(data.results) ? (data.results as TipoSindicato[]) : [],
  }
}

export async function createTipoSindicato(
  token: string,
  payload: { codigo: string; descripcion: string; activo: boolean }
): Promise<TipoSindicato> {
  return authRequest(apiEndpoints.tiposSindicato, {
    method: "POST",
    body: payload,
    token,
  }) as Promise<TipoSindicato>
}

export async function updateTipoSindicato(
  id: number,
  token: string,
  payload: { codigo: string; descripcion: string; activo: boolean }
): Promise<TipoSindicato> {
  return authRequest(`${apiEndpoints.tiposSindicato}${id}/`, {
    method: "PUT",
    body: payload,
    token,
  }) as Promise<TipoSindicato>
}

export async function deleteTipoSindicato(id: number, token: string): Promise<void> {
  await authRequest(`${apiEndpoints.tiposSindicato}${id}/`, { method: "DELETE", token })
}

