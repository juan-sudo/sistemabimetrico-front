import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { Cargo, CargoPayload } from "../interfaces/cargo.interface"

export async function fetchCargos(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.cargos, { token })
}

export async function createCargo(payload: CargoPayload, token: string): Promise<Cargo> {
  return authRequest(apiEndpoints.cargos, {
    method: "POST",
    body: payload,
    token,
  }) as Promise<Cargo>
}

export async function updateCargo(id: number, payload: CargoPayload, token: string): Promise<Cargo> {
  return authRequest(`${apiEndpoints.cargos}${id}/`, {
    method: "PUT",
    body: payload,
    token,
  }) as Promise<Cargo>
}

export async function deleteCargo(id: number, token: string): Promise<void> {
  await authRequest(`${apiEndpoints.cargos}${id}/`, { method: "DELETE", token })
}
