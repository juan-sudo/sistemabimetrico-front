import type { ModuleConfig, ModulePermission, UserForm, UserRow } from "../interfaces/usuario.interface"

export const MODULES: ModuleConfig[] = [
  { modulo: "ESCRITORIO", label: "Escritorio" },
  { modulo: "EMPRESAS", label: "Empresas" },
  { modulo: "USUARIOS", label: "Usuarios" },
  { modulo: "SUCURSALES", label: "Sucursales" },
  { modulo: "AREAS", label: "Areas" },
  { modulo: "CARGOS", label: "Cargos" },
  { modulo: "TIPO_TRABAJADOR", label: "Tipo trabajador" },
  { modulo: "TIPO_SINDICATO", label: "Sindicato" },
  { modulo: "CATEGORIAS", label: "Categorias" },
  { modulo: "TURNOS", label: "Turnos" },
  { modulo: "DISPOSITIVOS", label: "Dispositivos" },
  { modulo: "DESCARGAR_MARCAS", label: "Descargar marcas" },
  { modulo: "PERSONAL", label: "Personal" },
  { modulo: "BOLETA_MENSUAL", label: "Boleta mensual" },
  { modulo: "RESUMEN_PLANILLA", label: "Resumen planilla" },
  { modulo: "MARCACIONES", label: "Marcaciones" },
  { modulo: "PROCESAR_ASISTENCIA", label: "Procesar asistencia" },
  { modulo: "CONSULTAR_ASISTENCIA", label: "Consultar asistencia" },
  { modulo: "JUSTIFICACIONES", label: "Registrar justificacion" },
  { modulo: "AUTORIZAR_JUSTIFICACION", label: "Autorizar justificacion" },
  { modulo: "DESCANSO_MEDICO", label: "Descanso medico" },
]

export const asArray = (x: unknown) =>
  Array.isArray(x) ? x : x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results) ? (x as { results: unknown[] }).results : []

export const buildDefaultPermissions = (): ModulePermission[] =>
  MODULES.map((item) => ({
    modulo: item.modulo,
    puede_ver: false,
    puede_crear: false,
    puede_editar: false,
    puede_eliminar: false,
  }))

export const createDefaultForm = (): UserForm => ({
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  rol: "USUARIO",
  is_staff: false,
  is_active: true,
  is_superuser: false,
  module_permissions_input: buildDefaultPermissions(),
})

export function filterUsuarios(users: UserRow[], search: string, estadoFilter: string, rolFilter: string): UserRow[] {
  const term = search.trim().toLowerCase()
  return users.filter((item) => {
    const role = item.rol || (item.is_staff || item.is_superuser ? "ADMINISTRADOR" : "USUARIO")
    if (estadoFilter === "ACTIVO" && !item.is_active) return false
    if (estadoFilter === "INACTIVO" && item.is_active) return false
    if (rolFilter && role !== rolFilter) return false
    if (!term) return true
    return `${item.username} ${item.email} ${item.first_name} ${item.last_name} ${item.nombre_completo || ""}`.toLowerCase().includes(term)
  })
}

export function buildUsuariosCsv(filteredUsers: UserRow[]): string[] {
  const headers = ["Usuario", "Correo", "Nombre completo", "Rol", "Activo", "Staff", "Superusuario", "Modulos visibles"]
  return [
    headers.join(","),
    ...filteredUsers.map((user) =>
      [
        user.username,
        user.email || "",
        user.nombre_completo || `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        user.rol || (user.is_staff || user.is_superuser ? "ADMINISTRADOR" : "USUARIO"),
        user.is_active ? "Si" : "No",
        user.is_staff ? "Si" : "No",
        user.is_superuser ? "Si" : "No",
        String(user.modulos_visibles ?? user.module_permissions.filter((item) => item.puede_ver).length),
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ]
}

export function downloadCsv(filename: string, lines: string[]) {
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
