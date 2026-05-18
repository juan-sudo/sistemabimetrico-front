import type { Justificacion } from "../interfaces/autorizar-justificacion.interface"

export const months = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

export const asList = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === "object" && Array.isArray((value as { results?: unknown[] }).results)) {
    return (value as { results: T[] }).results
  }
  return []
}

export function getMonthIndex(month: string) {
  return months.indexOf(month)
}

export function buildAutorizarExportRows(
  rows: Justificacion[],
  sucursalMap: Record<number, string>,
  areaMap: Record<number, string>
) {
  return rows.map((row) => ({
    sucursal: row.sucursal_nombre || sucursalMap[row.sucursal] || "-",
    area: row.area_nombre || areaMap[row.area] || "-",
    numeroDocumento: row.personal_numero_documento || "-",
    nombres: row.personal_nombres_completos || "-",
    motivo: row.motivo,
    fechaInicio: row.fecha_inicio,
    fechaFin: row.fecha_fin,
    dias: row.dias,
    nombreDocumento: row.nombre_documento || "-",
    estado: row.estado,
  }))
}
