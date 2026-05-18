import type { FormState, HorarioPersonalRow, PersonalTurno, TurnoBlock } from "../interfaces/horario-personal.interface"

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

export function buildHorarioRows(asignaciones: PersonalTurno[]): HorarioPersonalRow[] {
  return asignaciones.map((item) => ({
    ...item,
    personalDoc: item.personal_documento || "-",
    personalNombre: item.personal_nombre || "-",
    areaNombre: item.area_nombre || "-",
    sucursalNombre: item.sucursal_nombre || "-",
    turnoNombre: item.turno_nombre || "-",
    horaEntrada: item.hora_entrada || "-",
    horaSalida: item.hora_salida || "-",
  }))
}

export function getTurnoBlocks(turnoId: string, turnos: Array<{ id: number; bloques_detalle?: TurnoBlock[] }>): TurnoBlock[] {
  const id = Number(turnoId)
  if (!id) return []
  const turno = turnos.find((item) => item.id === id)
  if (!turno?.bloques_detalle) return []
  return turno.bloques_detalle.slice().sort((a, b) => a.orden - b.orden)
}

