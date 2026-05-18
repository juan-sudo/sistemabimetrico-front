"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { FormState, TipoSindicato } from "../interfaces/sindicato.interface"
import {
  createTipoSindicato,
  deleteTipoSindicato,
  fetchTiposSindicato,
  updateTipoSindicato,
} from "../services/sindicato.service"
import { buildSindicatosCsv, downloadCsv, emptyForm } from "../utils/sindicato.utils"

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 350

export function useSindicatoPage() {
  const token = useUserStore((s) => s.accessToken)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("")
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<TipoSindicato | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [items, setItems] = useState<TipoSindicato[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [form, setForm] = useState<FormState>(emptyForm)

  const loadTipos = useCallback(async () => {
    if (!token) {
      setLoading(false)
      setInitialLoading(false)
      return
    }
    try {
      setLoading(true)
      setIsFetching(true)
      const data = await fetchTiposSindicato(token, {
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        estado: estadoFilter,
      })
      setItems(data.results)
      setTotalItems(data.count)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cargar sindicatos")
    } finally {
      setLoading(false)
      setInitialLoading(false)
      setIsFetching(false)
    }
  }, [debouncedSearch, estadoFilter, page, token])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1)
      setDebouncedSearch(search.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timeoutId)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [estadoFilter])

  useEffect(() => {
    void loadTipos()
  }, [loadTipos])

  const filteredRows = items

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
        const updated = await updateTipoSindicato(editingId, token, payload)
        setDetail((prev) => (prev?.id === editingId ? updated : prev))
        toast.success("Sindicato actualizado")
      } else {
        await createTipoSindicato(token, payload)
        toast.success("Sindicato creado")
      }
      await loadTipos()
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
      setDetail((prev) => (prev?.id === item.id ? null : prev))
      await loadTipos()
      toast.success("Sindicato eliminado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
    }
  }

  const onExport = () => {
    const lines = buildSindicatosCsv(filteredRows)
    downloadCsv("tipos-sindicato.csv", lines)
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / PAGE_SIZE)), [totalItems])
  const canPrev = page > 1
  const canNext = page < totalPages

  return {
    token,
    search,
    setSearch,
    estadoFilter,
    setEstadoFilter,
    page,
    setPage,
    totalItems,
    totalPages,
    canPrev,
    canNext,
    open,
    setOpen,
    detail,
    setDetail,
    loading,
    initialLoading,
    isFetching,
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

