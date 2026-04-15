import { apiEndpoints, authRequest } from "@/lib/api-client"

export async function fetchTurnosData(token: string): Promise<[unknown, unknown]> {
  return Promise.all([
    authRequest(apiEndpoints.turnos, { token }),
    authRequest(apiEndpoints.turnoBloquesHorario, { token }),
  ])
}

export async function createTurno(token: string, payload: { codigo: string; nombre: string; tipo: string; activo: boolean }): Promise<unknown> {
  return authRequest(apiEndpoints.turnos, {
    method: "POST",
    body: payload,
    token,
  })
}

export async function updateTurno(id: number, token: string, payload: { codigo: string; nombre: string; tipo: string; activo: boolean }): Promise<unknown> {
  return authRequest(`${apiEndpoints.turnos}${id}/`, {
    method: "PUT",
    body: payload,
    token,
  })
}

export async function deleteTurno(id: number, token: string): Promise<unknown> {
  return authRequest(`${apiEndpoints.turnos}${id}/`, { method: "DELETE", token })
}

export async function createBloqueTurno(
  token: string,
  payload: { turno: number; orden: number; hora_entrada: string; hora_salida: string }
): Promise<unknown> {
  return authRequest(apiEndpoints.turnoBloquesHorario, {
    method: "POST",
    body: payload,
    token,
  })
}

export async function deleteBloqueTurno(id: number, token: string): Promise<unknown> {
  return authRequest(`${apiEndpoints.turnoBloquesHorario}${id}/`, { method: "DELETE", token })
}
