export type Personal = {
  id: number
  numero_documento: string
  nombres_completos: string
  area: number
  sucursal: number
}

export type Turno = {
  id: number
  codigo: string
  nombre: string
  tipo: "GENERAL" | "GENERAL_PERSONALIZADO" | "DESCANSO"
}

export type Bloque = {
  id: number
  turno: number
  orden: number
  hora_entrada: string
  hora_salida: string
}

export type Area = {
  id: number
  nombre: string
}

export type Sucursal = {
  id: number
  nombre: string
}

export type PersonalTurno = {
  id: number
  personal: number
  turno: number
  fecha_inicio: string
  fecha_fin: string | null
  observacion: string
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
  horario: string
  horaEntrada: string
  horaSalida: string
}
