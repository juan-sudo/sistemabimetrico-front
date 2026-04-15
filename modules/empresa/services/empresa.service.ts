import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { Empresa, EmpresaPayload } from "../interfaces/empresa.interface"

type FetchEmpresasParams = {
  page?: number
  pageSize?: number
  search?: string
}

export async function fetchEmpresas(token: string, params?: FetchEmpresasParams): Promise<unknown> {
  const query = new URLSearchParams()

  if (params?.page) query.set("page", String(params.page))
  if (params?.pageSize) query.set("page_size", String(params.pageSize))
  if (params?.search?.trim()) query.set("search", params.search.trim())

  const url = query.size > 0 ? `${apiEndpoints.empresas}?${query.toString()}` : apiEndpoints.empresas
  return authRequest(url, { token })
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
