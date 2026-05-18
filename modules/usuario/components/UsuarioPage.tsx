"use client"

import { Download, Eye, KeyRound, Pencil, PlusCircle, Power, ShieldCheck, Trash2 } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useUsuarioPage } from "../hooks/useUsuarioPage"

export default function UsuarioPage() {
  const {
    token,
    loading,
    saving,
    search,
    setSearch,
    estadoFilter,
    setEstadoFilter,
    rolFilter,
    setRolFilter,
    openModal,
    setOpenModal,
    editingId,
    detail,
    setDetail,
    form,
    setForm,
    filteredUsers,
    resetModal,
    openCreate,
    openEdit,
    updatePermission,
    syncRole,
    handleSave,
    toggleActive,
    handleDelete,
    onExport,
    modules,
  } = useUsuarioPage()

  if (!token) return <section className="p-6 text-sm text-slate-600">Inicia sesion para continuar.</section>

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2 rounded-2xl border border-white/50 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
              <Button type="button" variant="outline" className="border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50" onClick={onExport}>
                <Download size={16} className="mr-2" />
                Reporte
              </Button>
              <Dialog open={openModal} onOpenChange={(next) => { if (!next) resetModal(); else setOpenModal(true) }}>
                <DialogTrigger asChild>
                  <Button type="button" className="bg-emerald-600 hover:bg-emerald-700" onClick={openCreate}>
                    <PlusCircle size={16} className="mr-2" />
                    Nuevo usuario
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[calc(100vw-1.5rem)] max-w-6xl">
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <Field label="Usuario">
                        <Input value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} />
                      </Field>
                      <Field label="Correo">
                        <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                      </Field>
                      <Field label="Nombres">
                        <Input value={form.first_name} onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))} />
                      </Field>
                      <Field label="Apellidos">
                        <Input value={form.last_name} onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))} />
                      </Field>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <Field label={editingId ? "Nueva contrasena (opcional)" : "Contrasena"}>
                        <Input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
                      </Field>
                      <Field label="Rol">
                        <select
                          className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                          value={form.rol}
                          onChange={(e) => syncRole(e.target.value as "ADMINISTRADOR" | "USUARIO")}
                        >
                          <option value="ADMINISTRADOR">Administrador</option>
                          <option value="USUARIO">Usuario</option>
                        </select>
                      </Field>
                      <ToggleField label="Activo" checked={form.is_active} onChange={(checked) => setForm((p) => ({ ...p, is_active: checked }))} />
                      <ToggleField label="Superusuario" checked={form.is_superuser} onChange={(checked) => setForm((p) => ({ ...p, is_superuser: checked, rol: checked ? "ADMINISTRADOR" : p.rol, is_staff: checked ? true : p.is_staff }))} />
                    </div>

                    <div className="rounded-xl border border-slate-200">
                      <div className="border-b border-slate-200 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-700">Permisos por modulo</p>
                      </div>
                      <div className="max-h-[420px] overflow-auto">
                        <table className="w-full min-w-[760px]">
                          <thead className="sticky top-0 z-10 bg-teal-700 text-white">
                            <tr className="text-xs">
                              <th className="px-3 py-2 text-left font-semibold">Modulo</th>
                              <th className="w-24 px-3 py-2 text-center font-semibold">Ver</th>
                              <th className="w-24 px-3 py-2 text-center font-semibold">Crear</th>
                              <th className="w-24 px-3 py-2 text-center font-semibold">Editar</th>
                              <th className="w-24 px-3 py-2 text-center font-semibold">Eliminar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {modules.map((module, index) => {
                              const current = form.module_permissions_input.find((item) => item.modulo === module.modulo)
                              if (!current) return null
                              return (
                                <tr key={module.modulo} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                  <td className="border-t border-slate-200 px-3 py-2 text-sm text-slate-700">{module.label}</td>
                                  <PermissionCell checked={current.puede_ver} onChange={(checked) => updatePermission(module.modulo, "puede_ver", checked)} />
                                  <PermissionCell checked={current.puede_crear} onChange={(checked) => updatePermission(module.modulo, "puede_crear", checked)} />
                                  <PermissionCell checked={current.puede_editar} onChange={(checked) => updatePermission(module.modulo, "puede_editar", checked)} />
                                  <PermissionCell checked={current.puede_eliminar} onChange={(checked) => updatePermission(module.modulo, "puede_eliminar", checked)} />
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <Button type="button" variant="outline" onClick={resetModal}>Cancelar</Button>
                      <Button type="button" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={saving}>
                        <KeyRound size={16} className="mr-2" />
                        {saving ? "Guardando..." : "Guardar usuario"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por usuario, correo o nombre"
            className="md:col-span-2"
          />
          <select className="h-10 rounded-md border border-input bg-white px-3 text-sm" value={rolFilter} onChange={(e) => setRolFilter(e.target.value)}>
            <option value="">Todos los roles</option>
            <option value="ADMINISTRADOR">Administradores</option>
            <option value="USUARIO">Usuarios</option>
          </select>
          <select className="h-10 rounded-md border border-input bg-white px-3 text-sm" value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activos</option>
            <option value="INACTIVO">Inactivos</option>
          </select>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Usuarios registrados: {filteredUsers.length}</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="max-h-[620px] overflow-auto">
            <table className="w-full min-w-[1180px]">
              <thead className="sticky top-0 z-10 bg-teal-700 text-white">
                <tr className="text-sm">
                  <th className="px-4 py-3 text-left font-semibold">Usuario</th>
                  <th className="px-4 py-3 text-left font-semibold">Correo</th>
                  <th className="px-4 py-3 text-left font-semibold">Nombre completo</th>
                  <th className="w-28 px-4 py-3 text-center font-semibold">Activo</th>
                  <th className="w-28 px-4 py-3 text-center font-semibold">Staff</th>
                  <th className="w-32 px-4 py-3 text-center font-semibold">Superusuario</th>
                  <th className="w-36 px-4 py-3 text-center font-semibold">Modulos</th>
                  <th className="w-28 px-4 py-3 text-center font-semibold">Rol</th>
                  <th className="w-24 px-4 py-3 text-center font-semibold">Detalle</th>
                  <th className="w-24 px-4 py-3 text-center font-semibold">Editar</th>
                  <th className="w-24 px-4 py-3 text-center font-semibold">Estado</th>
                  <th className="w-24 px-4 py-3 text-center font-semibold">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={12} className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                      Cargando usuarios...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                ) : filteredUsers.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="border-t border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">{user.username}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-sm text-slate-700">{user.email || "-"}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-sm text-slate-700">{user.nombre_completo || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "-"}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center text-sm">{user.is_active ? "Si" : "No"}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center text-sm">{user.is_staff ? "Si" : "No"}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center text-sm">{user.is_superuser ? "Si" : "No"}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center text-sm">{user.modulos_visibles ?? user.module_permissions.filter((item) => item.puede_ver).length}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center text-sm">{user.rol || (user.is_staff || user.is_superuser ? "ADMINISTRADOR" : "USUARIO")}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center">
                      <button type="button" className="inline-flex rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100" onClick={() => setDetail(user)}>
                        <Eye size={16} />
                      </button>
                    </td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center">
                      <button type="button" className="inline-flex rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-600 transition hover:bg-amber-100" onClick={() => openEdit(user)}>
                        <Pencil size={16} />
                      </button>
                    </td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center">
                      <button type="button" className={`inline-flex rounded-lg border p-2 transition ${user.is_active ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100" : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`} onClick={() => toggleActive(user)}>
                        <Power size={16} />
                      </button>
                    </td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center">
                      <button type="button" className="inline-flex rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100" onClick={() => handleDelete(user)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={!!detail} onOpenChange={(x) => !x && setDetail(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Detalle de usuario</DialogTitle></DialogHeader>
            {detail && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div><b>Usuario:</b> {detail.username}</div>
                  <div><b>Correo:</b> {detail.email || "-"}</div>
                  <div><b>Nombre completo:</b> {detail.nombre_completo || `${detail.first_name || ""} ${detail.last_name || ""}`.trim() || "-"}</div>
                  <div><b>Rol:</b> {detail.rol || (detail.is_staff || detail.is_superuser ? "ADMINISTRADOR" : "USUARIO")}</div>
                  <div><b>Activo:</b> {detail.is_active ? "Si" : "No"}</div>
                  <div><b>Staff:</b> {detail.is_staff ? "Si" : "No"}</div>
                  <div><b>Superusuario:</b> {detail.is_superuser ? "Si" : "No"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="mb-2 font-semibold text-slate-700">Modulos con acceso visible</p>
                  <div className="max-h-56 space-y-2 overflow-auto">
                    {detail.module_permissions.filter((item) => item.puede_ver).length === 0 ? (
                      <p className="text-slate-500">No tiene modulos visibles.</p>
                    ) : detail.module_permissions.filter((item) => item.puede_ver).map((item) => (
                      <div key={item.modulo} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <div className="font-medium text-slate-700">{item.modulo}</div>
                        <div className="text-xs text-slate-500">Crear: {item.puede_crear ? "Si" : "No"} | Editar: {item.puede_editar ? "Si" : "No"} | Eliminar: {item.puede_eliminar ? "Si" : "No"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter><Button onClick={() => setDetail(null)}>Cerrar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  )
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <button type="button" onClick={() => onChange(!checked)} className={`flex h-10 w-full items-center rounded-md border px-3 text-sm ${checked ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"}`}>
        {checked ? "Si" : "No"}
      </button>
    </div>
  )
}

function PermissionCell({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <td className="border-t border-slate-200 px-3 py-2 text-center">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </td>
  )
}
