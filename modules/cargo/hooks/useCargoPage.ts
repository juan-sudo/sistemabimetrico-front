"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Cargo, CargoFormState, CargoPayload } from "../interfaces/cargo.interface"
import { createCargo, deleteCargo, fetchCargos, updateCargo } from "../services/cargo.service"
import { emptyCargoForm, filterCargos, toCargoArray } from "../utils/cargo.utils"

export function useCargoPage() {
  const token = useUserStore((s) => s.accessToken)

  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [items, setItems] = useState<Cargo[]>([])
  const [form, setForm] = useState<CargoFormState>(emptyCargoForm)

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const data = await fetchCargos(token)
        setItems(toCargoArray(data))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar cargos")
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token])

  const filteredRows = useMemo(() => filterCargos(items, search), [items, search])

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyCargoForm())
  }

  const openCreateModal = () => {
    resetForm()
    setOpen(true)
  }

  const onEdit = (item: Cargo) => {
    setEditingId(item.id)
    setForm({
      codigo: item.codigo,
      descripcion: item.descripcion,
      activo: item.activo,
    })
    setOpen(true)
  }

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) resetForm()
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return

    const payload: CargoPayload = {
      codigo: form.codigo.trim(),
      descripcion: form.descripcion.trim(),
      activo: form.activo,
    }

    try {
      setSaving(true)

      if (editingId) {
        const updated = await updateCargo(editingId, payload, token)
        setItems((prev) => prev.map((x) => (x.id === editingId ? updated : x)))
        toast.success("Cargo actualizado")
      } else {
        const created = await createCargo(payload, token)
        setItems((prev) => [created, ...prev])
        toast.success("Cargo creado")
      }

      setOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar el cargo")
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (item: Cargo) => {
    if (!token || !window.confirm(`Eliminar cargo "${item.descripcion}"?`)) return

    try {
      await deleteCargo(item.id, token)
      setItems((prev) => prev.filter((x) => x.id !== item.id))
      toast.success("Cargo eliminado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar el cargo")
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
