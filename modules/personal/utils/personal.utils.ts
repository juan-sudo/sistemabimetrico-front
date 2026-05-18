import type { Catalog, FormState, Personal } from "../interfaces/personal.interface"

export const asArray = (x: unknown): unknown[] => {
  if (Array.isArray(x)) return x
  if (x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results)) {
    return (x as { results: unknown[] }).results
  }
  return []
}

export const emptyForm = (): FormState => ({
  empresa: "",
  sucursal: "",
  area: "",
  direccion: "",
  tipo_documento: "",
  tipo_trabajador: "",
  categoria: "",
  tipo_sindicato: "",
  cargo: "",
  codigo_empleado: "",
  numero_documento: "",
  nombres_completos: "",
  correo: "",
  telefono: "",
  fecha_ingreso: "",
  estado: "ACTIVO",
})

export function filterPersonalRows(params: {
  items: Personal[]
  search: string
  empresaFilter: string
  sucursalFilter: string
  areaFilter: string
  estadoFilter: string
}): Personal[] {
  const { items, search, empresaFilter, sucursalFilter, areaFilter, estadoFilter } = params
  const term = search.trim().toLowerCase()

  return items.filter((item) => {
    if (empresaFilter && String(item.empresa) !== empresaFilter) return false
    if (sucursalFilter && String(item.sucursal) !== sucursalFilter) return false
    if (areaFilter && String(item.area) !== areaFilter) return false
    if (estadoFilter && item.estado !== estadoFilter) return false
    if (!term) return true

    return [
      item.codigo_empleado,
      item.numero_documento,
      item.nombres_completos,
      item.correo,
      item.telefono,
      item.empresa_nombre,
      item.sucursal_nombre,
      item.area_nombre,
      item.cargo_nombre,
    ]
      .join(" ")
      .toLowerCase()
      .includes(term)
  })
}

export function buildResetFormState(params: {
  empresas: Catalog[]
  sucursales: Catalog[]
  areas: Catalog[]
  tiposTrab: Catalog[]
  categorias: Catalog[]
}): FormState {
  const { empresas, sucursales, areas, tiposTrab, categorias } = params

  const empresa = empresas[0] ? String(empresas[0].id) : ""
  const sucursal = sucursales.find((item) => String(item.empresa) === empresa)
  const area = areas.find((item) => String(item.sucursal) === String(sucursal?.id || ""))

  return {
    ...emptyForm(),
    empresa,
    sucursal: sucursal ? String(sucursal.id) : "",
    area: area ? String(area.id) : "",
    tipo_trabajador: String(tiposTrab[0]?.id || ""),
    categoria: String(categorias[0]?.id || ""),
  }
}
