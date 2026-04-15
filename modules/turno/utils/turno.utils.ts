import type { Bloque, FormState, TipoLabelMap, Turno, TurnoRow } from "../interfaces/turno.interface"

export const emptyForm = (): FormState => ({
  codigo: "",
  nombre: "",
  tipo: "GENERAL",
  activo: true,
  entrada1: "",
  salida1: "",
  entrada2: "",
  salida2: "",
})

export const asArray = (x: unknown) =>
  Array.isArray(x) ? x : x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results) ? (x as { results: unknown[] }).results : []

export const tipoLabel: TipoLabelMap = {
  GENERAL: "General",
  GENERAL_PERSONALIZADO: "General Personalizado",
  DESCANSO: "Descanso",
}

export function buildBloquesByTurno(bloques: Bloque[]): Record<number, Bloque[]> {
  const out: Record<number, Bloque[]> = {}
  for (const b of bloques) {
    if (!out[b.turno]) out[b.turno] = []
    out[b.turno].push(b)
  }
  Object.values(out).forEach((arr) => arr.sort((a, b) => a.orden - b.orden))
  return out
}

export function buildTurnoRows(turnos: Turno[], bloquesByTurno: Record<number, Bloque[]>): TurnoRow[] {
  return turnos.map((t) => {
    const bs = bloquesByTurno[t.id] || []
    return {
      ...t,
      entrada: bs.map((x) => x.hora_entrada.slice(0, 5)).join(" / "),
      salida: bs.map((x) => x.hora_salida.slice(0, 5)).join(" / "),
    }
  })
}

export function filterTurnos(rows: TurnoRow[], search: string, tipoFilter: string, estadoFilter: string): TurnoRow[] {
  const term = search.trim().toLowerCase()
  return rows.filter((item) => {
    if (tipoFilter && item.tipo !== tipoFilter) return false
    if (estadoFilter === "ACTIVO" && !item.activo) return false
    if (estadoFilter === "INACTIVO" && item.activo) return false
    if (!term) return true
    return `${item.codigo} ${item.nombre} ${item.descripcion_larga || ""}`.toLowerCase().includes(term)
  })
}

export function validateTurnoForm(form: FormState): string | null {
  if (!form.codigo.trim() || !form.nombre.trim()) return "Codigo y nombre son obligatorios."
  if (form.tipo === "DESCANSO") return null
  if (!form.entrada1 || !form.salida1) return "El bloque 1 (entrada/salida) es obligatorio."
  if (form.tipo === "GENERAL_PERSONALIZADO") {
    const hasSecond = !!form.entrada2 || !!form.salida2
    if (hasSecond && (!form.entrada2 || !form.salida2)) return "Completa entrada y salida del bloque 2."
  }
  return null
}

export function buildBloquesPayload(form: FormState): Array<{ orden: number; hora_entrada: string; hora_salida: string }> {
  if (form.tipo === "DESCANSO") {
    return [{ orden: 1, hora_entrada: "00:00", hora_salida: "00:00" }]
  }
  const result = [{ orden: 1, hora_entrada: form.entrada1, hora_salida: form.salida1 }]
  if (form.tipo === "GENERAL_PERSONALIZADO" && form.entrada2 && form.salida2) {
    result.push({ orden: 2, hora_entrada: form.entrada2, hora_salida: form.salida2 })
  }
  return result
}

export function buildTurnosCsv(filteredRows: TurnoRow[]): string[] {
  const headers = ["Codigo", "Nombre", "Tipo", "Horario", "Estado"]
  return [
    headers.join(","),
    ...filteredRows.map((item) =>
      [item.codigo, item.nombre, tipoLabel[item.tipo], item.horario || `${item.entrada || ""}${item.salida ? ` / ${item.salida}` : ""}`, item.activo ? "Activo" : "Inactivo"]
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
