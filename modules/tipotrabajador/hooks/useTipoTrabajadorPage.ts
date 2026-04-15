"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { FormState, TipoTrabajador } from "../interfaces/tipotrabajador.interface"
import { createTipoTrabajador, deleteTipoTrabajador, fetchTiposTrabajador, updateTipoTrabajador } from "../services/tipotrabajador.service"
import { asArray, buildTiposTrabajadorCsv, downloadCsv, emptyForm, filterTiposTrabajador } from "../utils/tipotrabajador.utils"

export function useTipoTrabajadorPage() {
  const token = useUserStore((s) => s.accessToken)
  const [search, setSearch] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("")
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<TipoTrabajador | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [items, setItems] = useState<TipoTrabajador[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const data = await fetchTiposTrabajador(token)
        setItems(asArray(data) as TipoTrabajador[])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar tipos de trabajador")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [token])

  const filteredRows = useMemo(() => filterTiposTrabajador(items, search, estadoFilter), [items, search, estadoFilter])

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm())
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return

    const payload = {
      codigo: form.codigo.trim(),
      descripcion: form.descripcion.trim(),
      activo: form.activo,
    }

    try {
      setSaving(true)
      if (editingId) {
        const updated = (await updateTipoTrabajador(editingId, token, payload)) as TipoTrabajador
        setItems((prev) => prev.map((x) => (x.id === editingId ? updated : x)))
        setDetail((prev) => (prev?.id === editingId ? updated : prev))
        toast.success("Tipo de trabajador actualizado")
      } else {
        const created = (await createTipoTrabajador(token, payload)) as TipoTrabajador
        setItems((prev) => [created, ...prev])
        toast.success("Tipo de trabajador creado")
      }
      setOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  const onEdit = (item: TipoTrabajador) => {
    setEditingId(item.id)
    setForm({
      codigo: item.codigo,
      descripcion: item.descripcion,
      activo: item.activo,
    })
    setOpen(true)
  }

  const onDelete = async (item: TipoTrabajador) => {
    if (!token || !window.confirm(`Eliminar tipo "${item.descripcion}"?`)) return
    try {
      await deleteTipoTrabajador(item.id, token)
      setItems((prev) => prev.filter((x) => x.id !== item.id))
      setDetail((prev) => (prev?.id === item.id ? null : prev))
      toast.success("Tipo de trabajador eliminado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
    }
  }

  const onExport = () => {
    const lines = buildTiposTrabajadorCsv(filteredRows)
    downloadCsv("tipos-trabajador.csv", lines)
  }

  return {
    token,
    search,
    setSearch,
    estadoFilter,
    setEstadoFilter,
    open,
    setOpen,
    detail,
    setDetail,
    loading,
    saving,
    editingId,
    form,
    setForm,
    filteredRows,
    resetForm,
    onSubmit,
    onEdit,
    onDelete,
    onExport,
  }
}
