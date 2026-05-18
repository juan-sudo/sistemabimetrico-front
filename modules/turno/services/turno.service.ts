import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { Turno, TurnoListResponse } from "../interfaces/turno.interface"

type FetchTurnosParams = {
  page?: number
  pageSize?: number
  search?: string
  tipo?: string
  estado?: string
}

export async function fetchTurnos(token: string, params?: FetchTurnosParams): Promise<TurnoListResponse> {
  const query = new URLSearchParams()
  if (params?.page) query.set("page", String(params.page))
  if (params?.pageSize) query.set("page_size", String(params.pageSize))
  if (params?.search?.trim()) query.set("q", params.search.trim())
  if (params?.tipo?.trim()) query.set("tipo", params.tipo.trim())
  if (params?.estado === "ACTIVO") query.set("activo", "true")
  if (params?.estado === "INACTIVO") query.set("activo", "false")
  const url = query.size > 0 ? `${apiEndpoints.turnos}?${query.toString()}` : apiEndpoints.turnos
  const response = await authRequest(url, { token })
  const data = response as Partial<TurnoListResponse>
  return {
    count: typeof data.count === "number" ? data.count : 0,
    next: typeof data.next === "string" ? data.next : null,
    previous: typeof data.previous === "string" ? data.previous : null,
    results: Array.isArray(data.results) ? (data.results as Turno[]) : [],
  }
}

export async function createTurno(
  token: string,
  payload: { codigo: string; nombre: string; tipo: string; activo: boolean }
): Promise<Turno> {
  return authRequest(apiEndpoints.turnos, {
    method: "POST",
    body: payload,
    token,
  }) as Promise<Turno>
}

export async function updateTurno(
  id: number,
  token: string,
  payload: { codigo: string; nombre: string; tipo: string; activo: boolean }
): Promise<Turno> {
  return authRequest(`${apiEndpoints.turnos}${id}/`, {
    method: "PUT",
    body: payload,
    token,
  }) as Promise<Turno>
}

export async function deleteTurno(id: number, token: string): Promise<void> {
  await authRequest(`${apiEndpoints.turnos}${id}/`, { method: "DELETE", token })
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

