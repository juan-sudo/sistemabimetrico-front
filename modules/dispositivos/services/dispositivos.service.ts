import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { ProbarConexionPayload } from "../interfaces/dispositivos.interface"

export async function fetchDispositivos(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.dispositivos, { token })
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
