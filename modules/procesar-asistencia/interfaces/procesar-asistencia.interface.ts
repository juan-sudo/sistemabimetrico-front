export type Personal = {
  id: number
  empresa: number
  sucursal: number
  area: number
  numero_documento: string
  codigo_empleado: string
  nombres_completos: string
}

export type Catalog = { id: number; nombre?: string; razon_social?: string }
export type Dispositivo = { id: number; activo: boolean; nombre: string }

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
