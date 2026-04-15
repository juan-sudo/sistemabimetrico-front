export type Personal = {
  id: number
  numero_documento: string
  nombres_completos: string
  area: number
  tipo_trabajador: number
}

export type Area = { id: number; nombre: string }
export type TipoTrabajador = { id: number; descripcion: string }
export type Boleta = { id: number; personal: number; anio: number; mes: number; sueldo_base: string | number }

export type PersonalBoleta = {
  id: number
  documento: string
  nombres: string
  area: string
  tipoTrabajador: string
  sueldoBase: number
}
