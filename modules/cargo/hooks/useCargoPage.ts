"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Cargo, CargoFormState, CargoPayload } from "../interfaces/cargo.interface"
import { createCargo, deleteCargo, fetchCargos, updateCargo } from "../services/cargo.service"
import { emptyCargoForm } from "../utils/cargo.utils"

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 350

export function useCargoPage() {
  const token = useUserStore((s) => s.accessToken)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [items, setItems] = useState<Cargo[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [form, setForm] = useState<CargoFormState>(emptyCargoForm)

  const loadCargos = useCallback(async () => {
    if (!token) {
      setLoading(false)
      setInitialLoading(false)
      return
    }
    try {
      setLoading(true)
      setIsFetching(true)
      const data = await fetchCargos(token, {
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
      })
      setItems(data.results)
      setTotalItems(data.count)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cargar cargos")
    } finally {
      setLoading(false)
      setInitialLoading(false)
      setIsFetching(false)
    }
  }, [debouncedSearch, page, token])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1)
      setDebouncedSearch(search.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timeoutId)
  }, [search])

  useEffect(() => {
    void loadCargos()
  }, [loadCargos])

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
        await updateCargo(editingId, payload, token)
        toast.success("Cargo actualizado")
      } else {
        await createCargo(payload, token)
        toast.success("Cargo creado")
      }
      await loadCargos()
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
      await loadCargos()
      toast.success("Cargo eliminado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar el cargo")
    }
  }

  const filteredRows = items
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / PAGE_SIZE)), [totalItems])
  const canPrev = page > 1
  const canNext = page < totalPages

  return {
    token,
    search,
    setSearch,
    page,
    setPage,
    totalItems,
    totalPages,
    canPrev,
    canNext,
    open,
    loading,
    initialLoading,
    isFetching,
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

