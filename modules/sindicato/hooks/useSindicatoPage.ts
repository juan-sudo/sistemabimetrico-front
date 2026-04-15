"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { FormState, TipoSindicato } from "../interfaces/sindicato.interface"
import { createTipoSindicato, deleteTipoSindicato, fetchTiposSindicato, updateTipoSindicato } from "../services/sindicato.service"
import { asArray, buildSindicatosCsv, downloadCsv, emptyForm, filterSindicatos } from "../utils/sindicato.utils"

export function useSindicatoPage() {
  const token = useUserStore((s) => s.accessToken)
  const [search, setSearch] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("")
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<TipoSindicato | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [items, setItems] = useState<TipoSindicato[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const data = await fetchTiposSindicato(token)
        setItems(asArray(data) as TipoSindicato[])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar sindicatos")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [token])

  const filteredRows = useMemo(() => filterSindicatos(items, search, estadoFilter), [items, search, estadoFilter])

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
        const updated = (await updateTipoSindicato(editingId, token, payload)) as TipoSindicato
        setItems((prev) => prev.map((x) => (x.id === editingId ? updated : x)))
        setDetail((prev) => (prev?.id === editingId ? updated : prev))
        toast.success("Sindicato actualizado")
      } else {
        const created = (await createTipoSindicato(token, payload)) as TipoSindicato
        setItems((prev) => [created, ...prev])
        toast.success("Sindicato creado")
      }
      setOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  const onEdit = (item: TipoSindicato) => {
    setEditingId(item.id)
    setForm({
      codigo: item.codigo,
      descripcion: item.descripcion,
      activo: item.activo,
    })
    setOpen(true)
  }

  const onDelete = async (item: TipoSindicato) => {
    if (!token || !window.confirm(`Eliminar sindicato "${item.descripcion}"?`)) return
    try {
      await deleteTipoSindicato(item.id, token)
      setItems((prev) => prev.filter((x) => x.id !== item.id))
      setDetail((prev) => (prev?.id === item.id ? null : prev))
      toast.success("Sindicato eliminado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
    }
  }

  const onExport = () => {
    const lines = buildSindicatosCsv(filteredRows)
    downloadCsv("tipos-sindicato.csv", lines)
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
