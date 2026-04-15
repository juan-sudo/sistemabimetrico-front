export type ModulePermission = {
  modulo: string
  puede_ver: boolean
  puede_crear: boolean
  puede_editar: boolean
  puede_eliminar: boolean
}

export type UserRow = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  nombre_completo?: string
  rol?: "ADMINISTRADOR" | "USUARIO"
  modulos_visibles?: number
  is_staff: boolean
  is_active: boolean
  is_superuser: boolean
  module_permissions: ModulePermission[]
}

export type UserForm = {
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
  rol: "ADMINISTRADOR" | "USUARIO"
  is_staff: boolean
  is_active: boolean
  is_superuser: boolean
  module_permissions_input: ModulePermission[]
}

export type ModuleConfig = {
  modulo: string
  label: string
}
