export type Cargo = {
  id: number
  codigo: string
  descripcion: string
  activo: boolean
}

export type CargoFormState = {
  codigo: string
  descripcion: string
  activo: boolean
}

export type CargoPayload = {
  codigo: string
  descripcion: string
  activo: boolean
}

export type CargoListResponse = {
  count: number
  next: string | null
  previous: string | null
  results: Cargo[]
}
