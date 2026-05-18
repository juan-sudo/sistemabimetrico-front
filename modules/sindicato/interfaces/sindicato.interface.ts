export type TipoSindicato = {
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

export type TipoSindicatoListResponse = {
  count: number
  next: string | null
  previous: string | null
  results: TipoSindicato[]
}
