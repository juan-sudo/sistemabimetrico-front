import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { Empresa, EmpresaListResponse, EmpresaPayload } from "../interfaces/empresa.interface"

type FetchEmpresasParams = {
  page?: number
  pageSize?: number
  search?: string
}

export function normalizeEmpresaListResponse(response: unknown): EmpresaListResponse {
  const data = response as Partial<EmpresaListResponse>
  return {
    count: typeof data.count === "number" ? data.count : 0,
    next: typeof data.next === "string" ? data.next : null,
    previous: typeof data.previous === "string" ? data.previous : null,
    results: Array.isArray(data.results) ? (data.results as Empresa[]) : [],
  }
}

export async function fetchEmpresas(token: string, params?: FetchEmpresasParams): Promise<EmpresaListResponse> {
  const query = new URLSearchParams()

  if (params?.page) query.set("page", String(params.page))
  if (params?.pageSize) query.set("page_size", String(params.pageSize))
  if (params?.search?.trim()) query.set("search", params.search.trim())

  const url = query.size > 0 ? `${apiEndpoints.empresas}?${query.toString()}` : apiEndpoints.empresas
  const response = await authRequest(url, { token })
  return normalizeEmpresaListResponse(response)
}

export async function createEmpresa(payload: EmpresaPayload, token: string): Promise<Empresa> {
  return authRequest(apiEndpoints.empresas, {
    method: "POST",
    body: payload,
    token,
  }) as Promise<Empresa>
}

export async function updateEmpresa(id: number, payload: EmpresaPayload, token: string): Promise<Empresa> {
  return authRequest(`${apiEndpoints.empresas}${id}/`, {
    method: "PUT",
    body: payload,
    token,
  }) as Promise<Empresa>
}

export async function deleteEmpresa(id: number, token: string): Promise<void> {
  await authRequest(`${apiEndpoints.empresas}${id}/`, { method: "DELETE", token })
}
