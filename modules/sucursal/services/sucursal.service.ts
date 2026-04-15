import { apiEndpoints, authRequest } from "@/lib/api-client"

export async function fetchSucursalesData(token: string): Promise<[unknown, unknown]> {
  return Promise.all([
    authRequest(apiEndpoints.empresas, { token }),
    authRequest(apiEndpoints.sucursales, { token }),
  ])
}

export async function createSucursal(token: string, payload: { empresa: number; codigo: string; nombre: string; activo: boolean }): Promise<unknown> {
  return authRequest(apiEndpoints.sucursales, {
    method: "POST",
    body: payload,
    token,
  })
}

export async function updateSucursal(id: number, token: string, payload: { empresa: number; codigo: string; nombre: string; activo: boolean }): Promise<unknown> {
  return authRequest(`${apiEndpoints.sucursales}${id}/`, {
    method: "PUT",
    body: payload,
    token,
  })
}

export async function deleteSucursal(id: number, token: string): Promise<unknown> {
  return authRequest(`${apiEndpoints.sucursales}${id}/`, { method: "DELETE", token })
}
