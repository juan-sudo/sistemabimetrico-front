import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { DispositivoListResponse, ProbarConexionPayload } from "../interfaces/dispositivos.interface"

type FetchDispositivosParams = {
  paginated?: boolean
  page?: number
  pageSize?: number
  search?: string
}

export async function fetchDispositivos(token: string, params?: FetchDispositivosParams): Promise<DispositivoListResponse> {
  const query = new URLSearchParams()
  if (typeof params?.paginated === "boolean") query.set("paginated", params.paginated ? "1" : "0")
  if (params?.page) query.set("page", String(params.page))
  if (params?.pageSize) query.set("page_size", String(params.pageSize))
  if (params?.search?.trim()) query.set("q", params.search.trim())
  const url = query.size > 0 ? `${apiEndpoints.dispositivos}?${query.toString()}` : apiEndpoints.dispositivos
  const response = await authRequest(url, { token })

  if (Array.isArray(response)) {
    return {
      count: response.length,
      next: null,
      previous: null,
      results: response,
    }
  }

  const data = response as Partial<DispositivoListResponse>
  return {
    count: typeof data.count === "number" ? data.count : Array.isArray(data.results) ? data.results.length : 0,
    next: typeof data.next === "string" ? data.next : null,
    previous: typeof data.previous === "string" ? data.previous : null,
    results: Array.isArray(data.results) ? data.results : [],
  }
}

export async function createDispositivo(token: string, body: Record<string, unknown>): Promise<unknown> {
  return authRequest(apiEndpoints.dispositivos, {
    method: "POST",
    body,
    token,
  })
}

export async function deleteDispositivo(token: string, id: number): Promise<unknown> {
  return authRequest(`${apiEndpoints.dispositivos}${id}/`, {
    method: "DELETE",
    token,
  })
}

export async function probarConexionDispositivo(token: string, payload: ProbarConexionPayload): Promise<unknown> {
  return authRequest(`${apiEndpoints.dispositivos}probar-conexion/`, {
    method: "POST",
    body: {
      ...payload,
      clave_comunicacion: 0,
    },
    token,
  })
}
