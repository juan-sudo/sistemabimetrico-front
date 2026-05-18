import { apiEndpoints, authRequest } from "@/lib/api-client"

type FetchDispositivosParams = {
  search?: string
  activo?: boolean
  pageSize?: number
}

export async function fetchDispositivos(token: string, params?: FetchDispositivosParams): Promise<unknown> {
  const query = new URLSearchParams()
  if (typeof params?.activo === "boolean") query.set("activo", params.activo ? "true" : "false")
  if (params?.pageSize) query.set("page_size", String(params.pageSize))
  if (params?.search?.trim()) query.set("q", params.search.trim())
  const url = query.size > 0 ? `${apiEndpoints.dispositivos}?${query.toString()}` : apiEndpoints.dispositivos
  return authRequest(url, { token })
}

export async function descargarDispositivo(
  token: string,
  dispositivoIds: number[],
  claveComunicacion: number
): Promise<unknown> {
  return authRequest(`${apiEndpoints.descargasMarcaciones}descargar-dispositivo/`, {
    method: "POST",
    body: { dispositivo_ids: dispositivoIds, clave_comunicacion: claveComunicacion },
    token,
  })
}

export async function verRawDispositivo(
  token: string,
  dispositivoIds: number[],
  fechaInicio: string,
  fechaFin: string,
  claveComunicacion: number
): Promise<unknown> {
  return authRequest(`${apiEndpoints.descargasMarcaciones}ver-raw-dispositivo/`, {
    method: "POST",
    body: {
      dispositivo_ids: dispositivoIds,
      clave_comunicacion: claveComunicacion,
      fecha_inicio: fechaInicio || undefined,
      fecha_fin: fechaFin || undefined,
      include_raw: true,
      raw_limit: 500,
    },
    token,
  })
}

export async function verCapacidadDispositivo(
  token: string,
  dispositivoIds: number[],
  claveComunicacion: number
): Promise<unknown> {
  return authRequest(`${apiEndpoints.descargasMarcaciones}ver-capacidad-dispositivo/`, {
    method: "POST",
    body: { dispositivo_ids: dispositivoIds, clave_comunicacion: claveComunicacion },
    token,
  })
}
