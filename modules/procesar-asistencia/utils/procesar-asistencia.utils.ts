import type { Catalog, Personal } from "../interfaces/procesar-asistencia.interface"

export const asArray = (x: unknown): unknown[] => {
  if (Array.isArray(x)) return x
  if (x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results)) {
    return (x as { results: unknown[] }).results
  }
  return []
}

export const toInputDate = (value: Date): string => value.toISOString().slice(0, 10)

export const toSlashDate = (value: string): string => {
  const [year, month, day] = value.split("-")
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

export const getPeriodFromRange = (start: string): { anio: string; mes: string } => {
  const [year, month] = start.split("-")
  return { anio: year || String(new Date().getFullYear()), mes: String(Number(month || "1")) }
}

export function filterPersonales(params: {
  personales: Personal[]
  search: string
  empresaMap: Record<number, string>
  sucursalMap: Record<number, string>
  areaMap: Record<number, string>
}): Personal[] {
  const { personales, search, empresaMap, sucursalMap, areaMap } = params
  const term = search.trim().toLowerCase()
  if (!term) return personales

  return personales.filter((item) =>
    `${empresaMap[item.empresa] || ""} ${sucursalMap[item.sucursal] || ""} ${areaMap[item.area] || ""} ${item.numero_documento} ${item.codigo_empleado} ${item.nombres_completos}`
      .toLowerCase()
      .includes(term)
  )
}

export function buildCatalogMap(rows: Catalog[], key: "nombre" | "razon_social"): Record<number, string> {
  return Object.fromEntries(rows.map((item) => [item.id, item[key] || "-"]))
}
