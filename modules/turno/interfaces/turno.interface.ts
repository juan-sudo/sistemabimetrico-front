export type Bloque = {
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
  activo: boolean
  horario?: string
  descripcion_larga?: string
  bloques_detalle?: Bloque[]
}

export type FormState = {
  codigo: string
  nombre: string
  tipo: Turno["tipo"]
  activo: boolean
  entrada1: string
  salida1: string
  entrada2: string
  salida2: string
}

export type TurnoRow = Turno & {
  entrada: string
  salida: string
}

export type TipoLabelMap = Record<Turno["tipo"], string>

export type TurnoListResponse = {
  count: number
  next: string | null
  previous: string | null
  results: Turno[]
}

