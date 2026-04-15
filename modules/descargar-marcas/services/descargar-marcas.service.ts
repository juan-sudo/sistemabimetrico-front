import { apiEndpoints, authRequest } from "@/lib/api-client"

export async function fetchDispositivos(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.dispositivos, { token })
}

export async function descargarDispositivo(token: string, dispositivoIds: number[]): Promise<unknown> {
  return authRequest(`${apiEndpoints.descargasMarcaciones}descargar-dispositivo/`, {
    method: "POST",
    body: { dispositivo_ids: dispositivoIds, clave_comunicacion: 0 },
    token,
  })
}

export async function verRawDispositivo(
  token: string,
  dispositivoIds: number[],
  fechaInicio: string,
  fechaFin: string
): Promise<unknown> {
  return authRequest(`${apiEndpoints.descargasMarcaciones}ver-raw-dispositivo/`, {
    method: "POST",
    body: {
      dispositivo_ids: dispositivoIds,
      clave_comunicacion: 0,
      fecha_inicio: fechaInicio || undefined,
      fecha_fin: fechaFin || undefined,
    },
    token,
  })
}

export async function verCapacidadDispositivo(token: string, dispositivoIds: number[]): Promise<unknown> {
  return authRequest(`${apiEndpoints.descargasMarcaciones}ver-capacidad-dispositivo/`, {
    method: "POST",
    body: { dispositivo_ids: dispositivoIds, clave_comunicacion: 0 },
    token,
  })
}
