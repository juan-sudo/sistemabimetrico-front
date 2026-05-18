import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { Categoria, CategoriaListResponse, CategoriaPayload } from "../interfaces/categoria.interface"

type FetchCategoriasParams = {
  page?: number
  pageSize?: number
  search?: string
}

export async function fetchCategorias(token: string, params?: FetchCategoriasParams): Promise<CategoriaListResponse> {
  const query = new URLSearchParams()
  if (params?.page) query.set("page", String(params.page))
  if (params?.pageSize) query.set("page_size", String(params.pageSize))
  if (params?.search?.trim()) query.set("q", params.search.trim())
  const url = query.size > 0 ? `${apiEndpoints.categorias}?${query.toString()}` : apiEndpoints.categorias
  const response = await authRequest(url, { token })
  const data = response as Partial<CategoriaListResponse>
  return {
    count: typeof data.count === "number" ? data.count : 0,
    next: typeof data.next === "string" ? data.next : null,
    previous: typeof data.previous === "string" ? data.previous : null,
    results: Array.isArray(data.results) ? (data.results as Categoria[]) : [],
  }
}

export async function createCategoria(payload: CategoriaPayload, token: string): Promise<Categoria> {
  return authRequest(apiEndpoints.categorias, {
    method: "POST",
    body: payload,
    token,
  }) as Promise<Categoria>
}

export async function updateCategoria(id: number, payload: CategoriaPayload, token: string): Promise<Categoria> {
  return authRequest(`${apiEndpoints.categorias}${id}/`, {
    method: "PUT",
    body: payload,
    token,
  }) as Promise<Categoria>
}

export async function deleteCategoria(id: number, token: string): Promise<void> {
  await authRequest(`${apiEndpoints.categorias}${id}/`, { method: "DELETE", token })
}

