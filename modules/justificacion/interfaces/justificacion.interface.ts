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
