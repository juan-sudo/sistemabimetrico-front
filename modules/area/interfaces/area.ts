export type AreaTipo = "GERENCIA" | "OFICINA" | "SUBGERENCIA" | "UNIDAD"

export type Empresa = { id: number; razon_social: string }
export type Sucursal = { id: number; empresa: number; nombre: string }

export type Area = {
  id: number
  sucursal: number
  codigo: string
  nombre: string
  tipo: AreaTipo
  parent: number | null
  activo: boolean
}

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type FormState = {
  codigo: string
  nombre: string
  tipo: AreaTipo
  parent: string
  activo: boolean
}

export type AreaPayload = {
  sucursal: number
  codigo: string
  nombre: string
  tipo: AreaTipo
  parent: number | null
  activo: boolean
}
