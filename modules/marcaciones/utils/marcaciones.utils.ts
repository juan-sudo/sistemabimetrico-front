import type { Catalog, FormState, Marcacion, Personal } from "../interfaces/marcaciones.interface"

export const asArray = (x: unknown): unknown[] => {
  if (Array.isArray(x)) return x
  if (x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results)) {
    return (x as { results: unknown[] }).results
  }
  return []
}

export function createDefaultForm(): FormState {
  return {
    empresa: "Todos",
    sucursal: "Todos",
    area: "Todos",
    tipoDocumento: "Todos",
    tipoTrabajador: "Todos",
    categoria: "Todos",
    tipoSindicato: "Todos",
    filtrarPor: "",
    situacion: "Activo",
    codigoEmpleado: "",
    numeroDocumento: "",
    codigoEquipo: "",
    nombres: "",
  }
}

export function mapPersonalesToMarcaciones(personales: Personal[], empresas: Catalog[], sucursales: Catalog[], areas: Catalog[]): Marcacion[] {
  const eMap = Object.fromEntries(empresas.map((x) => [x.id, x.razon_social || x.nombre || x.descripcion || ""]))
  const sMap = Object.fromEntries(sucursales.map((x) => [x.id, x.nombre || x.descripcion || ""]))
  const aMap = Object.fromEntries(areas.map((x) => [x.id, x.nombre || x.descripcion || ""]))

  return personales.map((item) => ({
    id: item.id,
    empresa: eMap[item.empresa] || `ID ${item.empresa}`,
    sucursal: sMap[item.sucursal] || `ID ${item.sucursal}`,
    area: aMap[item.area] || `ID ${item.area}`,
    codigoEmpleado: item.codigo_empleado,
    numeroDocumento: item.numero_documento,
    codigoEquipo: item.codigo_empleado || item.numero_documento,
    nombres: item.nombres_completos,
    situacion: item.estado === "ACTIVO" ? "Activo" : "Inactivo",
  }))
}

export function buildOptions(rows: Catalog[], key: "descripcion" | "nombre" | "razon_social" = "nombre"): string[] {
  return ["Todos", ...rows.map((x) => x[key] || x.descripcion || x.nombre || x.razon_social || "")].filter(Boolean)
}
