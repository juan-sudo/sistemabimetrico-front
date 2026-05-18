export type Personal = {
  id: number
  codigo_empleado: string
  numero_documento: string
  nombres_completos: string
  area: number
}

export type Area = {
  id: number
  nombre: string
}

export type Marcacion = {
  id: number
  personal: number
  personal_codigo_empleado?: string
  personal_numero_documento?: string
  personal_nombres_completos?: string
  personal_area?: number
  dispositivo: number | null
  descarga: number | null
  fecha_hora: string
  codigo_equipo: string
  tipo_evento: "ENTRADA" | "SALIDA"
  situacion: string
}

export type PersonalTurno = {
  id: number
  personal: number
  turno: number
  fecha_inicio: string
  fecha_fin: string | null
}

export type Turno = {
  id: number
  nombre: string
}

export type TurnoBloque = {
  id: number
  turno: number
  orden: number
  hora_entrada: string
  hora_salida: string
}

export type JustificacionLite = {
  id: number
  personal: number
  fecha_inicio: string
  fecha_fin: string
  estado: "AUTORIZADO" | "NO_AUTORIZADO" | "PENDIENTE"
}

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type FullRow = {
  id: number
  codigoEmpleado: string
  numeroDocumento: string
  area: string
  nombresCompletos: string
  turno: string
  horario: string
  dia: string
  fecha: string
  hEnt: string
  hSal: string
  mEnt: string
  mSal: string
  tRefrigerio: string
  salRefrigerio: string
  entRef: string
  refTomado: string
  tardRef: string
  tardanza: string
  eTemprano: string
  conGoce: string
  sinGoce: string
  sTemprano: string
  hDiurnas: string
  hNocturnas: string
  hExtras: string
  hExtrasRedondeo: string
  hECompensar: string
  hEPagar: string
  p25: string
  p35: string
  hed: string
  p25Hed: string
  p35Hed: string
  hen: string
  p25Hen: string
  p35Hen: string
  p100: string
  tLaborables: string
  tTrabajado: string
  hCompensado: string
  falta: string
  just: string
  feriado: string
}
