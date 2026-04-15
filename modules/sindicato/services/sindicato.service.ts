import { apiEndpoints, authRequest } from "@/lib/api-client"

export async function fetchTiposSindicato(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.tiposSindicato, { token })
}

export async function createTipoSindicato(token: string, payload: { codigo: string; descripcion: string; activo: boolean }): Promise<unknown> {
  return authRequest(apiEndpoints.tiposSindicato, {
    method: "POST",
    body: payload,
    token,
  })
}

export async function updateTipoSindicato(id: number, token: string, payload: { codigo: string; descripcion: string; activo: boolean }): Promise<unknown> {
  return authRequest(`${apiEndpoints.tiposSindicato}${id}/`, {
    method: "PUT",
    body: payload,
    token,
  })
}

export async function deleteTipoSindicato(id: number, token: string): Promise<unknown> {
  return authRequest(`${apiEndpoints.tiposSindicato}${id}/`, { method: "DELETE", token })
}
