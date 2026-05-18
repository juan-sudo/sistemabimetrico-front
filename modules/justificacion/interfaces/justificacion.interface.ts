export type Personal = {
  id: number
  numero_documento: string
  nombres_completos: string
  sucursal: number
  area: number
}

export type Sucursal = { id: number; nombre: string }
export type Area = { id: number; nombre: string; sucursal: number }

export type Justificacion = {
  id: number
  personal: number
  sucursal: number
  area: number
  motivo: string
  tipo: "SALIDA" | "INGRESO"
  rango: "PARCIAL" | "COMPLETO"
  fecha_inicio: string
  fecha_fin: string
  dias: number
  descripcion: string
  tiene_adjunto: boolean
  numero_documento: string
  nombre_documento: string
  estado: "AUTORIZADO" | "NO_AUTORIZADO" | "PENDIENTE"
  motivo_no_autorizacion: string
  personal_nombres_completos?: string
  personal_numero_documento?: string
  sucursal_nombre?: string
  area_nombre?: string
}

export type JustificacionForm = {
  motivo: string
  tipo: Justificacion["tipo"]
  rango: Justificacion["rango"]
  fecha_inicio: string
  fecha_fin: string
  dias: string
  descripcion: string
  tiene_adjunto: boolean
  numero_documento: string
  nombre_documento: string
}

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
