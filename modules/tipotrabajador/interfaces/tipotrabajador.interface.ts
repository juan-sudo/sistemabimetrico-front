export type TipoTrabajador = {
  id: number
  codigo: string
  descripcion: string
  activo: boolean
  descripcion_larga?: string
}

export type FormState = {
  codigo: string
  descripcion: string
  activo: boolean
}

export type TipoTrabajadorListResponse = {
  count: number
  next: string | null
  previous: string | null
  results: TipoTrabajador[]
}
