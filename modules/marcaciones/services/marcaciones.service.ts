import { apiEndpoints, authRequest } from "@/lib/api-client"

const CACHE_STATIC_MS = 5 * 60 * 1000
const CACHE_DYNAMIC_MS = 30 * 1000

export async function fetchMarcacionesBaseData(token: string): Promise<[unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]> {
  return Promise.all([
    authRequest(apiEndpoints.personales, { token, cacheMs: CACHE_DYNAMIC_MS }),
    authRequest(apiEndpoints.empresas, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.sucursales, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.areas, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.tiposDocumento, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.tiposTrabajador, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.categorias, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.tiposSindicato, { token, cacheMs: CACHE_STATIC_MS }),
  ])
}
