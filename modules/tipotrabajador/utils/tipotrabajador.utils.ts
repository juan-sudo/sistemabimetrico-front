import type { FormState, TipoTrabajador } from "../interfaces/tipotrabajador.interface"

export const emptyForm = (): FormState => ({
  codigo: "",
  descripcion: "",
  activo: true,
})

export const asArray = (x: unknown) =>
  Array.isArray(x) ? x : x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results) ? (x as { results: unknown[] }).results : []

export function filterTiposTrabajador(items: TipoTrabajador[], search: string, estadoFilter: string): TipoTrabajador[] {
  const term = search.trim().toLowerCase()
  return items.filter((item) => {
    if (estadoFilter === "ACTIVO" && !item.activo) return false
    if (estadoFilter === "INACTIVO" && item.activo) return false
    if (!term) return true
    return `${item.codigo} ${item.descripcion} ${item.descripcion_larga || ""}`.toLowerCase().includes(term)
  })
}

export function buildTiposTrabajadorCsv(filteredRows: TipoTrabajador[]): string[] {
  const headers = ["Codigo", "Descripcion", "Estado"]
  return [
    headers.join(","),
    ...filteredRows.map((item) =>
      [item.codigo, item.descripcion, item.activo ? "Activo" : "Inactivo"]
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
