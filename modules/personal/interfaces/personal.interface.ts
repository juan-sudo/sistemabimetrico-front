export type Personal = {
  id: number
  empresa: number
  sucursal: number
  area: number
  direccion: string | null
  tipo_documento: string | null
  tipo_trabajador: number
  categoria: number
  tipo_sindicato: number | null
  cargo: number | null
  codigo_empleado: string
  numero_documento: string
  nombres_completos: string
  correo: string
  telefono: string
  fecha_ingreso: string | null
  estado: "ACTIVO" | "INACTIVO"
  empresa_nombre?: string
  sucursal_nombre?: string
  area_nombre?: string
  direccion_nombre?: string
  tipo_documento_nombre?: string
  tipo_trabajador_nombre?: string
  categoria_nombre?: string
  tipo_sindicato_nombre?: string
  cargo_nombre?: string
}

export type Catalog = {
  id: number
  empresa?: number
  sucursal?: number
  nombre?: string
  descripcion?: string
  razon_social?: string
}

export type FormState = {
  empresa: string
  sucursal: string
  area: string
  direccion: string
  tipo_documento: string
  tipo_trabajador: string
  categoria: string
  tipo_sindicato: string
  cargo: string
  codigo_empleado: string
  numero_documento: string
  nombres_completos: string
  correo: string
  telefono: string
  fecha_ingreso: string
  estado: "ACTIVO" | "INACTIVO"
}
