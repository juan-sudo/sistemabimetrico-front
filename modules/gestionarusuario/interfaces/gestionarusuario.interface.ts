import type { Licencia } from "../components/licencias/LicenciasCard"

export type UsuarioResumen = {
  codigo: string
  dni: string
  nombres: string
}

export type GestionarUsuarioData = {
  usuarios: UsuarioResumen[]
  licencias: Licencia[]
}
