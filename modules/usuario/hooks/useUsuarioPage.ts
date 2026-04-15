"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { ModulePermission, UserForm, UserRow } from "../interfaces/usuario.interface"
import { createUsuario, deleteUsuario, fetchUsuarios, patchUsuario } from "../services/usuario.service"
import { asArray, buildUsuariosCsv, createDefaultForm, downloadCsv, filterUsuarios, MODULES } from "../utils/usuario.utils"

export function useUsuarioPage() {
  const token = useUserStore((s) => s.accessToken)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("")
  const [rolFilter, setRolFilter] = useState("")
  const [users, setUsers] = useState<UserRow[]>([])
  const [openModal, setOpenModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [detail, setDetail] = useState<UserRow | null>(null)
  const [form, setForm] = useState<UserForm>(createDefaultForm())

  const loadUsers = async () => {
    if (!token) return
    const data = await fetchUsuarios(token)
    setUsers(asArray(data) as UserRow[])
  }

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        await loadUsers()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar usuarios")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [token])

  const filteredUsers = useMemo(() => filterUsuarios(users, search, estadoFilter, rolFilter), [users, search, estadoFilter, rolFilter])

  const resetModal = () => {
    setEditingId(null)
    setForm(createDefaultForm())
    setOpenModal(false)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(createDefaultForm())
    setOpenModal(true)
  }

  const openEdit = (user: UserRow) => {
    const permissionMap = Object.fromEntries(user.module_permissions.map((item) => [item.modulo, item]))
    setEditingId(user.id)
    setForm({
      username: user.username,
      email: user.email || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      password: "",
      rol: user.is_staff || user.is_superuser ? "ADMINISTRADOR" : "USUARIO",
      is_staff: user.is_staff,
      is_active: user.is_active,
      is_superuser: user.is_superuser,
      module_permissions_input: MODULES.map((item) => ({
        modulo: item.modulo,
        puede_ver: permissionMap[item.modulo]?.puede_ver || false,
        puede_crear: permissionMap[item.modulo]?.puede_crear || false,
        puede_editar: permissionMap[item.modulo]?.puede_editar || false,
        puede_eliminar: permissionMap[item.modulo]?.puede_eliminar || false,
      })),
    })
    setOpenModal(true)
  }

  const updatePermission = (modulo: string, key: keyof ModulePermission, value: boolean) => {
    setForm((prev) => ({
      ...prev,
      module_permissions_input: prev.module_permissions_input.map((item) =>
        item.modulo === modulo ? { ...item, [key]: value } : item
      ),
    }))
  }

  const syncRole = (rol: "ADMINISTRADOR" | "USUARIO") => {
    setForm((prev) => ({
      ...prev,
      rol,
      is_staff: rol === "ADMINISTRADOR",
      is_superuser: rol === "ADMINISTRADOR" ? prev.is_superuser : false,
    }))
  }

  const handleSave = async () => {
    if (!token || !form.username.trim()) return

    try {
      setSaving(true)
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        is_staff: form.is_staff,
        is_active: form.is_active,
        is_superuser: form.is_superuser,
        ...(form.password.trim() ? { password: form.password.trim() } : {}),
        module_permissions_input: form.module_permissions_input,
      }

      if (editingId) {
        await patchUsuario(editingId, token, payload)
        toast.success("Usuario actualizado")
      } else {
        if (!form.password.trim()) {
          toast.error("La contrasena es obligatoria para crear un usuario")
          return
        }
        await createUsuario(token, payload)
        toast.success("Usuario creado")
      }

      await loadUsers()
      resetModal()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar usuario")
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (user: UserRow) => {
    if (!token) return
    try {
      await patchUsuario(user.id, token, { is_active: !user.is_active })
      await loadUsers()
      setDetail((prev) => (prev?.id === user.id ? { ...prev, is_active: !user.is_active } : prev))
      toast.success(user.is_active ? "Usuario desactivado" : "Usuario activado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar estado")
    }
  }

  const handleDelete = async (user: UserRow) => {
    if (!token) return
    try {
      await deleteUsuario(user.id, token)
      await loadUsers()
      setDetail((prev) => (prev?.id === user.id ? null : prev))
      toast.success("Usuario eliminado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar usuario")
    }
  }

  const onExport = () => {
    const lines = buildUsuariosCsv(filteredUsers)
    downloadCsv("usuarios.csv", lines)
  }

  return {
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
    modules: MODULES,
  }
}
