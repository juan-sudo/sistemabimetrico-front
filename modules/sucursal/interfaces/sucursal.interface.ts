export type Empresa = {
  id: number
  codigo?: string
  razon_social: string
}

export type Sucursal = {
  id: number
  empresa: number
  codigo: string
  nombre: string
  activo: boolean
  empresa_nombre?: string
  empresa_codigo?: string
  descripcion?: string
}

export type FormState = {
  empresa: string
  codigo: string
  nombre: string
  activo: boolean
}
