import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { Categoria, CategoriaPayload } from "../interfaces/categoria.interface"

export async function fetchCategorias(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.categorias, { token })
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
