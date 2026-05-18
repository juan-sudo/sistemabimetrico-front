export type FiltroEstado = "AUTORIZADO" | "NO_AUTORIZADO" | "TODOS"

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
  nombre_documento: string
  descripcion: string
  estado: "AUTORIZADO" | "NO_AUTORIZADO" | "PENDIENTE"
  gestionado_por: number | null
  fecha_gestion: string | null
  motivo_no_autorizacion: string
  personal_nombres_completos?: string
  personal_numero_documento?: string
  sucursal_nombre?: string
  area_nombre?: string
}

export type Sucursal = { id: number; nombre: string }
export type Area = { id: number; nombre: string; sucursal: number }
