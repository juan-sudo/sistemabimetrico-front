export type Personal = {
  id: number
  numero_documento: string
  nombres_completos: string
}

export type TurnoBlock = {
  id: number
  turno: number
  orden: number
  hora_entrada: string
  hora_salida: string
}

export type Turno = {
  id: number
  codigo: string
  nombre: string
  tipo: "GENERAL" | "GENERAL_PERSONALIZADO" | "DESCANSO"
  bloques_detalle?: TurnoBlock[]
}

export type PersonalTurno = {
  id: number
  personal: number
  turno: number
  fecha_inicio: string
  fecha_fin: string | null
  observacion: string
  personal_nombre: string
  personal_documento: string
  sucursal_nombre: string
  area_nombre: string
  turno_nombre: string
  horario: string
  hora_entrada: string
  hora_salida: string
}

export type FormState = {
  personal: string
  turno: string
  fechaInicio: string
  fechaFin: string
  observacion: string
}

export type HorarioPersonalRow = PersonalTurno & {
  personalDoc: string
  personalNombre: string
  areaNombre: string
  sucursalNombre: string
  turnoNombre: string
  horaEntrada: string
  horaSalida: string
}

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

