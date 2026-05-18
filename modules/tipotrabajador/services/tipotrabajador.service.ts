import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { TipoTrabajador, TipoTrabajadorListResponse } from "../interfaces/tipotrabajador.interface"

type FetchTiposTrabajadorParams = {
  page?: number
  pageSize?: number
  search?: string
  estado?: string
}

export async function fetchTiposTrabajador(
  token: string,
  params?: FetchTiposTrabajadorParams
): Promise<TipoTrabajadorListResponse> {
  const query = new URLSearchParams()
  if (params?.page) query.set("page", String(params.page))
  if (params?.pageSize) query.set("page_size", String(params.pageSize))
  if (params?.search?.trim()) query.set("q", params.search.trim())
  if (params?.estado === "ACTIVO") query.set("activo", "true")
  if (params?.estado === "INACTIVO") query.set("activo", "false")
  const url = query.size > 0 ? `${apiEndpoints.tiposTrabajador}?${query.toString()}` : apiEndpoints.tiposTrabajador
  const response = await authRequest(url, { token })
  const data = response as Partial<TipoTrabajadorListResponse>
  return {
    count: typeof data.count === "number" ? data.count : 0,
    next: typeof data.next === "string" ? data.next : null,
    previous: typeof data.previous === "string" ? data.previous : null,
    results: Array.isArray(data.results) ? (data.results as TipoTrabajador[]) : [],
  }
}

export async function createTipoTrabajador(
  token: string,
  payload: { codigo: string; descripcion: string; activo: boolean }
): Promise<TipoTrabajador> {
  return authRequest(apiEndpoints.tiposTrabajador, {
    method: "POST",
    body: payload,
    token,
  }) as Promise<TipoTrabajador>
}

export async function updateTipoTrabajador(
  id: number,
  token: string,
  payload: { codigo: string; descripcion: string; activo: boolean }
): Promise<TipoTrabajador> {
  return authRequest(`${apiEndpoints.tiposTrabajador}${id}/`, {
    method: "PUT",
    body: payload,
    token,
  }) as Promise<TipoTrabajador>
}

export async function deleteTipoTrabajador(id: number, token: string): Promise<void> {
  await authRequest(`${apiEndpoints.tiposTrabajador}${id}/`, { method: "DELETE", token })
}

