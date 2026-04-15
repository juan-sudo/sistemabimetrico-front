import type { Empresa, FormState, Sucursal } from "../interfaces/sucursal.interface"

export const emptyForm = (): FormState => ({
  empresa: "",
  codigo: "",
  nombre: "",
  activo: true,
})

export const asArray = (x: unknown) =>
  Array.isArray(x) ? x : x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results) ? (x as { results: unknown[] }).results : []

export function buildEmpresaMap(empresas: Empresa[]): Record<number, string> {
  return Object.fromEntries(empresas.map((x) => [x.id, x.razon_social]))
}

export function filterSucursales(rows: Sucursal[], search: string, empresaFilter: string, estadoFilter: string): Sucursal[] {
  const term = search.trim().toLowerCase()
  return rows.filter((item) => {
    if (empresaFilter && item.empresa !== Number(empresaFilter)) return false
    if (estadoFilter === "ACTIVO" && !item.activo) return false
    if (estadoFilter === "INACTIVO" && item.activo) return false
    if (!term) return true
    return [item.codigo, item.nombre, item.descripcion, item.empresa_nombre, item.empresa_codigo]
      .join(" ")
      .toLowerCase()
      .includes(term)
  })
}

export function buildSucursalesCsv(rows: Sucursal[], empresaMap: Record<number, string>): string[] {
  const headers = ["Codigo", "Sucursal", "Empresa", "Estado"]
  return [
    headers.join(","),
    ...rows.map((item) =>
      [item.codigo, item.nombre, item.empresa_nombre || empresaMap[item.empresa] || "", item.activo ? "Activa" : "Inactiva"]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ]
}

export function downloadCsv(filename: string, lines: string[]) {
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
