import { apiEndpoints, authRequest } from "@/lib/api-client"

const CACHE_STATIC_MS = 5 * 60 * 1000
const CACHE_DYNAMIC_MS = 30 * 1000

export async function fetchProcesarAsistenciaData(token: string): Promise<[unknown, unknown, unknown, unknown, unknown]> {
  return Promise.all([
    authRequest(apiEndpoints.personales, { token, cacheMs: CACHE_DYNAMIC_MS }),
    authRequest(apiEndpoints.empresas, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.sucursales, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.areas, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.dispositivos, { token, cacheMs: CACHE_DYNAMIC_MS }),
  ])
}

export async function descargarMarcacionesDispositivos(token: string, dispositivoIds: number[]): Promise<unknown> {
  return authRequest(`${apiEndpoints.descargasMarcaciones}descargar-dispositivo/`, {
    method: "POST",
    body: {
      dispositivo_ids: dispositivoIds,
      clave_comunicacion: 0,
    },
    token,
  })
}

export async function generarReporteGeneral(token: string, personalId: number, anio: string, mes: string): Promise<unknown> {
  return authRequest(`${apiEndpoints.personales}${personalId}/reporte-general/?anio=${anio}&mes=${mes}`, { token })
}
