import type {
  Area,
  Bloque,
  FormState,
  HorarioPersonalRow,
  Personal,
  PersonalTurno,
  Sucursal,
  Turno,
} from "../interfaces/horario-personal.interface"

export const emptyForm = (): FormState => ({
  personal: "",
  turno: "",
  fechaInicio: "",
  fechaFin: "",
  observacion: "",
})

export const asArray = (x: unknown): unknown[] => {
  if (Array.isArray(x)) return x
  if (x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results)) {
    return (x as { results: unknown[] }).results
  }
  return []
}

export function formatTimeRange(blocks: Bloque[], key: "hora_entrada" | "hora_salida"): string {
  return blocks.map((item) => item[key].slice(0, 5)).join(" / ")
}

export function buildBloquesByTurno(bloques: Bloque[]): Record<number, Bloque[]> {
  const out: Record<number, Bloque[]> = {}
  for (const item of bloques) {
    if (!out[item.turno]) out[item.turno] = []
    out[item.turno].push(item)
  }
  Object.values(out).forEach((items) => items.sort((a, b) => a.orden - b.orden))
  return out
}

export function buildHorarioRows(params: {
  asignaciones: PersonalTurno[]
  personales: Personal[]
  turnos: Turno[]
  bloquesByTurno: Record<number, Bloque[]>
  areas: Area[]
  sucursales: Sucursal[]
}): HorarioPersonalRow[] {
  const { asignaciones, personales, turnos, bloquesByTurno, areas, sucursales } = params

  const personalMap = Object.fromEntries(personales.map((item) => [item.id, item])) as Record<number, Personal>
  const turnoMap = Object.fromEntries(turnos.map((item) => [item.id, item])) as Record<number, Turno>
  const areaMap = Object.fromEntries(areas.map((item) => [item.id, item.nombre])) as Record<number, string>
  const sucursalMap = Object.fromEntries(sucursales.map((item) => [item.id, item.nombre])) as Record<number, string>

  return asignaciones.map((item) => {
    const personal = personalMap[item.personal]
    const turno = turnoMap[item.turno]
    const turnBlocks = turno ? bloquesByTurno[turno.id] || [] : []

    return {
      ...item,
      personalDoc: personal?.numero_documento || "-",
      personalNombre: personal?.nombres_completos || "-",
      areaNombre: personal ? areaMap[personal.area] || "-" : "-",
      sucursalNombre: personal ? sucursalMap[personal.sucursal] || "-" : "-",
      turnoNombre: turno ? `${turno.nombre}` : "-",
      horario: turnBlocks.length
        ? turnBlocks.map((block) => `${block.hora_entrada.slice(0, 5)}-${block.hora_salida.slice(0, 5)}`).join(" / ")
        : "-",
      horaEntrada: formatTimeRange(turnBlocks, "hora_entrada") || "-",
      horaSalida: formatTimeRange(turnBlocks, "hora_salida") || "-",
    }
  })
}

export function filterHorarioRows(rows: HorarioPersonalRow[], search: string): HorarioPersonalRow[] {
  const term = search.trim().toLowerCase()
  if (!term) return rows
  return rows.filter((item) =>
    `${item.personalDoc} ${item.personalNombre} ${item.areaNombre} ${item.turnoNombre}`.toLowerCase().includes(term)
  )
}
