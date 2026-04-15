import { apiEndpoints, authRequest } from "@/lib/api-client"

export async function fetchUsuarios(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.usuarios, { token })
}

export async function createUsuario(token: string, payload: Record<string, unknown>): Promise<unknown> {
  return authRequest(apiEndpoints.usuarios, {
    method: "POST",
    body: payload,
    token,
  })
}

export async function patchUsuario(id: number, token: string, payload: Record<string, unknown>): Promise<unknown> {
  return authRequest(`${apiEndpoints.usuarios}${id}/`, {
    method: "PATCH",
    body: payload,
    token,
  })
}

export async function deleteUsuario(id: number, token: string): Promise<unknown> {
  return authRequest(`${apiEndpoints.usuarios}${id}/`, {
    method: "DELETE",
    token,
  })
}
