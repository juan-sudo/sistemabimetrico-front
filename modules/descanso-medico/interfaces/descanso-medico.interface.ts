export type Personal = {
  id: number
  codigo_empleado: string
  numero_documento: string
  nombres_completos: string
  sucursal: number
  area: number
  cargo: number | null
  estado: "ACTIVO" | "INACTIVO"
  correo: string
  telefono: string
  fecha_ingreso: string | null
}

export type Sucursal = { id: number; nombre: string }
export type Area = { id: number; nombre: string; sucursal: number }

export type Descanso = {
  id: number
  personal: number
  motivo: "SALUD" | "SUBSIDIO"
  fecha_inicio: string
  fecha_fin: string
  dias: number
  citt: string
  diagnostico: string
  tiene_adjunto: boolean
  numero_documento: string
  personal_nombres_completos?: string
  personal_numero_documento?: string
  personal_codigo_empleado?: string
  personal_sucursal?: number
  personal_area?: number
  personal_sucursal_nombre?: string
  personal_area_nombre?: string
}

export type DescansoForm = {
  motivo: "" | "SALUD" | "SUBSIDIO"
  fecha_inicio: string
  fecha_fin: string
  dias: string
  citt: string
  diagnostico: string
  tiene_adjunto: boolean
  numero_documento: string
}

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
