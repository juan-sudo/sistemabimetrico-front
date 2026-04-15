export type Categoria = {
  id: number
  codigo: string
  descripcion: string
  periodos_vacacionales: boolean
  dias_por_periodo: number
  activo: boolean
}

export type CategoriaFormState = {
  codigo: string
  descripcion: string
  periodos_vacacionales: boolean
  dias_por_periodo: string
  activo: boolean
}

export type CategoriaPayload = {
  codigo: string
  descripcion: string
  periodos_vacacionales: boolean
  dias_por_periodo: number
  activo: boolean
}
