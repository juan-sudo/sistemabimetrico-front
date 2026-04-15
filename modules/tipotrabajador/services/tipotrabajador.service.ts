import { apiEndpoints, authRequest } from "@/lib/api-client"

export async function fetchTiposTrabajador(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.tiposTrabajador, { token })
}

export async function createTipoTrabajador(token: string, payload: { codigo: string; descripcion: string; activo: boolean }): Promise<unknown> {
  return authRequest(apiEndpoints.tiposTrabajador, {
    method: "POST",
    body: payload,
    token,
  })
}

export async function updateTipoTrabajador(id: number, token: string, payload: { codigo: string; descripcion: string; activo: boolean }): Promise<unknown> {
  return authRequest(`${apiEndpoints.tiposTrabajador}${id}/`, {
    method: "PUT",
    body: payload,
    token,
  })
}

export async function deleteTipoTrabajador(id: number, token: string): Promise<unknown> {
  return authRequest(`${apiEndpoints.tiposTrabajador}${id}/`, { method: "DELETE", token })
}
