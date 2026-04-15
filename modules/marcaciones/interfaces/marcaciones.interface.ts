export type Personal = {
  id: number
  empresa: number
  sucursal: number
  area: number
  tipo_documento: number
  tipo_trabajador: number
  categoria: number
  tipo_sindicato: number | null
  codigo_empleado: string
  numero_documento: string
  nombres_completos: string
  estado: "ACTIVO" | "INACTIVO"
}

export type Catalog = {
  id: number
  nombre?: string
  descripcion?: string
  razon_social?: string
}

export type Marcacion = {
  id: number
  empresa: string
  sucursal: string
  area: string
  codigoEmpleado: string
  numeroDocumento: string
  codigoEquipo: string
  nombres: string
  situacion: "Activo" | "Inactivo"
}

export type FormState = {
  empresa: string
  sucursal: string
  area: string
  tipoDocumento: string
  tipoTrabajador: string
  categoria: string
  tipoSindicato: string
  filtrarPor: string
  situacion: Marcacion["situacion"]
  codigoEmpleado: string
  numeroDocumento: string
  codigoEquipo: string
  nombres: string
}
