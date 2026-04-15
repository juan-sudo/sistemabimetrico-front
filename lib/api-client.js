const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "")
const inflightGetRequests = new Map()
const getResponseCache = new Map()
const DEFAULT_GET_CACHE_MS = Number(process.env.NEXT_PUBLIC_GET_CACHE_MS || 10000)

export function getApiBase() {
  return API_BASE
}

function createApiError(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

export async function loginRequest(username, password) {
  const response = await fetch(`${API_BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw createApiError(data.detail || "No se pudo iniciar sesion.", response.status)
  }
  return data
}

/**
 * @typedef {Object} AuthRequestOptions
 * @property {string} [method]
 * @property {unknown} [body]
 * @property {string | null} [token]
 * @property {number} [cacheMs]
 * @property {string} [cacheKey]
 * @property {boolean} [forceRefresh]
 */

/**
 * @param {string} path
 * @param {AuthRequestOptions} [options]
 */
export async function authRequest(path, options = {}) {
  const { method = "GET", body, token, cacheMs, cacheKey, forceRefresh = false } = options
  const normalizedMethod = String(method || "GET").toUpperCase()
  const effectiveCacheMs =
    normalizedMethod === "GET"
      ? (typeof cacheMs === "number" ? cacheMs : DEFAULT_GET_CACHE_MS)
      : 0
  /** @type {Record<string, string>} */
  const headers = { "Content-Type": "application/json" }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const url = `${API_BASE}${path}`
  const tokenSegment = token ? token.slice(0, 12) : "anon"
  const requestKey = cacheKey || `${normalizedMethod}:${tokenSegment}:${url}`
  const now = Date.now()

  if (normalizedMethod !== "GET") {
    getResponseCache.clear()
  }

  const clone = (data) => {
    if (typeof structuredClone === "function") return structuredClone(data)
    return JSON.parse(JSON.stringify(data))
  }

  if (normalizedMethod === "GET" && effectiveCacheMs > 0 && !forceRefresh) {
    const cached = getResponseCache.get(requestKey)
    if (cached && cached.expiresAt > now) {
      return clone(cached.data)
    }
  }

  if (normalizedMethod === "GET" && inflightGetRequests.has(requestKey)) {
    return inflightGetRequests.get(requestKey)
  }

  const run = (async () => {
    const response = await fetch(url, {
      method: normalizedMethod,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw createApiError(data.detail || "Error de API.", response.status)
    }

    const data = await response.json().catch(() => ({}))

    if (normalizedMethod === "GET" && effectiveCacheMs > 0) {
      getResponseCache.set(requestKey, {
        data,
        expiresAt: Date.now() + effectiveCacheMs,
      })
    }

    return clone(data)
  })()

  if (normalizedMethod === "GET") {
    inflightGetRequests.set(requestKey, run)
  }

  try {
    return await run
  } finally {
    if (normalizedMethod === "GET") {
      inflightGetRequests.delete(requestKey)
    }
  }
}

export const apiEndpoints = {
  usuarios: "/usuarios/",
  empresas: "/empresas/",
  sucursales: "/sucursales/",
  areas: "/areas/",
  cargos: "/cargos/",
  tiposTrabajador: "/tipos-trabajador/",
  categorias: "/categorias/",
  tiposDocumento: "/tipos-documento/",
  tiposSindicato: "/tipos-sindicato/",
  ubicacionesGeograficas: "/ubicaciones-geograficas/",
  personales: "/personales/",
  turnos: "/turnos/",
  turnoBloquesHorario: "/turno-bloques-horario/",
  personalTurnos: "/personal-turnos/",
  dispositivos: "/dispositivos/",
  descargasMarcaciones: "/descargas-marcaciones/",
  notificacionesMarcacionesFaltantes: "/descargas-marcaciones/notificaciones-faltantes/",
  marcaciones: "/marcaciones/",
  justificaciones: "/justificaciones/",
  descansosMedicos: "/descansos-medicos/",
  boletasMensuales: "/boletas-mensuales/",
  boletasConceptos: "/boletas-conceptos/",
  reportesPersonal: "/reportes-personal/",
  reportesAsistenciaDiaria: "/reportes-asistencia-diaria/",
  reportesConceptos: "/reportes-conceptos/",
  reportesIncidencias: "/reportes-incidencias/",
  dashboardResumen: "/dashboard-resumen/",
  usuariosAgua: "/usuarios-agua/",
  licenciasAgua: "/licencias-agua/",
}
