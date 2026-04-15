"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Categoria, CategoriaFormState } from "../interfaces/categoria.interface"
import { createCategoria, deleteCategoria, fetchCategorias, updateCategoria } from "../services/categoria.service"
import { emptyCategoriaForm, filterCategorias, toCategoriaArray, toCategoriaPayload } from "../utils/categoria.utils"

export function useCategoriaPage() {
  const token = useUserStore((s) => s.accessToken)

  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [items, setItems] = useState<Categoria[]>([])
  const [form, setForm] = useState<CategoriaFormState>(emptyCategoriaForm)

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const data = await fetchCategorias(token)
        setItems(toCategoriaArray(data))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar categorias")
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token])

  const filteredRows = useMemo(() => filterCategorias(items, search), [items, search])

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyCategoriaForm())
  }

  const openCreateModal = () => {
    resetForm()
    setOpen(true)
  }

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) resetForm()
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return

    const payload = toCategoriaPayload(form)

    try {
      setSaving(true)

      if (editingId) {
        const updated = await updateCategoria(editingId, payload, token)
        setItems((prev) => prev.map((x) => (x.id === editingId ? updated : x)))
        toast.success("Categoria actualizada")
      } else {
        const created = await createCategoria(payload, token)
        setItems((prev) => [created, ...prev])
        toast.success("Categoria creada")
      }

      setOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar la categoria")
    } finally {
      setSaving(false)
    }
  }

  const onEdit = (item: Categoria) => {
    setEditingId(item.id)
    setForm({
      codigo: item.codigo,
      descripcion: item.descripcion,
      periodos_vacacionales: item.periodos_vacacionales,
      dias_por_periodo: String(item.dias_por_periodo ?? 0),
      activo: item.activo,
    })
    setOpen(true)
  }

  const onDelete = async (item: Categoria) => {
    if (!token || !window.confirm(`Eliminar categoria "${item.descripcion}"?`)) return

    try {
      await deleteCategoria(item.id, token)
      setItems((prev) => prev.filter((x) => x.id !== item.id))
      toast.success("Categoria eliminada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
    }
  }

  return {
    token,
    search,
    setSearch,
    open,
    loading,
    saving,
    editingId,
    form,
    setForm,
    filteredRows,
    onSubmit,
    onEdit,
    onDelete,
    onOpenChange,
    openCreateModal,
  }
}
