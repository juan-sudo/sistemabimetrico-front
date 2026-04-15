export type Empresa = {
  id: number
  codigo: string
  razon_social: string
  ruc: string
  correo: string
  logo: string | null
  activo: boolean
}

export type EmpresaFormState = {
  codigo: string
  razon_social: string
  ruc: string
  correo: string
  activo: boolean
}

export type EmpresaPayload = {
  codigo: string
  razon_social: string
  ruc: string
  correo: string
  activo: boolean
}
