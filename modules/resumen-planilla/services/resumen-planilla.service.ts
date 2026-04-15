import { apiEndpoints, authRequest } from "@/lib/api-client"

export async function fetchResumenPlanillaPersonales(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.personales, { token })
}

export async function fetchResumenPlanillaByPersonal(token: string, personalId: string, anio: string, mes: string): Promise<unknown> {
  return authRequest(`${apiEndpoints.personales}${personalId}/resumen-planilla/?anio=${anio}&mes=${mes}`, { token })
}

export async function fetchReporteGeneralByPersonal(token: string, personalId: string, anio: string, mes: string): Promise<unknown> {
  return authRequest(`${apiEndpoints.personales}${personalId}/reporte-general/?anio=${anio}&mes=${mes}`, { token })
}
