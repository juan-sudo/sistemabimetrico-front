import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { Area, AreaPayload, Empresa, Sucursal } from "../interfaces/area"
import { asArray } from "../utils/area"

export const fetchAreaData = async (token: string) => {
  const [e, s, a] = await Promise.all([
    authRequest(apiEndpoints.empresas, { token }),
    authRequest(apiEndpoints.sucursales, { token }),
    authRequest(apiEndpoints.areas, { token }),
  ])

  return {
    empresas: asArray<Empresa>(e),
    sucursales: asArray<Sucursal>(s),
    areas: asArray<Area>(a),
  }
}

export const createArea = (token: string, payload: AreaPayload) =>
  authRequest(apiEndpoints.areas, {
    method: "POST",
    body: payload,
    token,
  }) as Promise<Area>

export const updateArea = (token: string, id: number, payload: AreaPayload) =>
  authRequest(`${apiEndpoints.areas}${id}/`, {
    method: "PUT",
    body: payload,
    token,
  }) as Promise<Area>

export const deleteArea = (token: string, id: number) =>
  authRequest(`${apiEndpoints.areas}${id}/`, {
    method: "DELETE",
    token,
  })
