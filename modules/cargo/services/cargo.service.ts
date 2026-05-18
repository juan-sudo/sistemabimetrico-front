import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { Cargo, CargoListResponse, CargoPayload } from "../interfaces/cargo.interface"

type FetchCargosParams = {
  page?: number
  pageSize?: number
  search?: string
}

export async function fetchCargos(token: string, params?: FetchCargosParams): Promise<CargoListResponse> {
  const query = new URLSearchParams()
  if (params?.page) query.set("page", String(params.page))
  if (params?.pageSize) query.set("page_size", String(params.pageSize))
  if (params?.search?.trim()) query.set("q", params.search.trim())
  const url = query.size > 0 ? `${apiEndpoints.cargos}?${query.toString()}` : apiEndpoints.cargos
  const response = await authRequest(url, { token })
  const data = response as Partial<CargoListResponse>
  return {
    count: typeof data.count === "number" ? data.count : 0,
    next: typeof data.next === "string" ? data.next : null,
    previous: typeof data.previous === "string" ? data.previous : null,
    results: Array.isArray(data.results) ? (data.results as Cargo[]) : [],
  }
}

export async function createCargo(payload: CargoPayload, token: string): Promise<Cargo> {
  return authRequest(apiEndpoints.cargos, {
    method: "POST",
    body: payload,
    token,
  }) as Promise<Cargo>
}

export async function updateCargo(id: number, payload: CargoPayload, token: string): Promise<Cargo> {
  return authRequest(`${apiEndpoints.cargos}${id}/`, {
    method: "PUT",
    body: payload,
    token,
  }) as Promise<Cargo>
}

export async function deleteCargo(id: number, token: string): Promise<void> {
  await authRequest(`${apiEndpoints.cargos}${id}/`, { method: "DELETE", token })
}

