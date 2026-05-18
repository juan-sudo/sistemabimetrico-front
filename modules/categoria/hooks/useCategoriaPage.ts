"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Categoria, CategoriaFormState } from "../interfaces/categoria.interface"
import { createCategoria, deleteCategoria, fetchCategorias, updateCategoria } from "../services/categoria.service"
import { emptyCategoriaForm, toCategoriaPayload } from "../utils/categoria.utils"

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 350

export function useCategoriaPage() {
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
  const [items, setItems] = useState<Categoria[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [form, setForm] = useState<CategoriaFormState>(emptyCategoriaForm)

  const loadCategorias = useCallback(async () => {
    if (!token) {
      setLoading(false)
      setInitialLoading(false)
      return
    }
    try {
      setLoading(true)
      setIsFetching(true)
      const data = await fetchCategorias(token, {
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
      })
      setItems(data.results)
      setTotalItems(data.count)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cargar categorias")
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
    void loadCategorias()
  }, [loadCategorias])

  const filteredRows = items

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
        await updateCategoria(editingId, payload, token)
        toast.success("Categoria actualizada")
      } else {
        await createCategoria(payload, token)
        toast.success("Categoria creada")
      }

      await loadCategorias()
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
      await loadCategorias()
      toast.success("Categoria eliminada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
    }
  }

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

