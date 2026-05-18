"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Empresa, EmpresaFormState, EmpresaListResponse } from "../interfaces/empresa.interface"
import { createEmpresa, deleteEmpresa, fetchEmpresas, updateEmpresa } from "../services/empresa.service"
import { emptyEmpresaForm, toEmpresaPayload } from "../utils/empresa.utils"

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 350

export function useEmpresaPage(initialData?: EmpresaListResponse | null) {
  const token = useUserStore((s) => s.accessToken)

  const [items, setItems] = useState<Empresa[]>(initialData?.results ?? [])
  const [totalItems, setTotalItems] = useState(initialData?.count ?? 0)
  const [loading, setLoading] = useState(!initialData)
  const [initialLoading, setInitialLoading] = useState(!initialData)
  const [isFetching, setIsFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<EmpresaFormState>(emptyEmpresaForm)
  const [hasConsumedInitialData, setHasConsumedInitialData] = useState(Boolean(initialData))

  const loadEmpresas = useCallback(async () => {
    if (!token) {
      setLoading(false)
      setInitialLoading(false)
      return
    }

    try {
      setLoading(true)
      setIsFetching(true)
      const data = await fetchEmpresas(token, {
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
      })
      setItems(data.results)
      setTotalItems(data.count)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cargar empresas")
    } finally {
      setLoading(false)
      setInitialLoading(false)
      setIsFetching(false)
    }
  }, [debouncedSearch, page, token])

  useEffect(() => {
    if (hasConsumedInitialData && page === 1 && !debouncedSearch.trim()) {
      setHasConsumedInitialData(false)
      setLoading(false)
      setInitialLoading(false)
      return
    }
    void loadEmpresas()
  }, [debouncedSearch, hasConsumedInitialData, loadEmpresas, page])
  
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1)
      setDebouncedSearch(search.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [search])

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyEmpresaForm())
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return

    const payload = toEmpresaPayload(form)

    try {
      setSaving(true)
      if (editingId) {
        await updateEmpresa(editingId, payload, token)
        toast.success("Empresa actualizada")
      } else {
        await createEmpresa(payload, token)
        toast.success("Empresa creada")
      }
      await loadEmpresas()
      setOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar la empresa")
    } finally {
      setSaving(false)
    }
  }

  const onEdit = (item: Empresa) => {
    setEditingId(item.id)
    setForm({
      codigo: item.codigo,
      razon_social: item.razon_social,
      ruc: item.ruc,
      correo: item.correo || "",
      activo: item.activo,
    })
    setOpen(true)
  }

  const onDelete = async (item: Empresa) => {
    if (!token || !window.confirm(`Eliminar empresa "${item.razon_social}"?`)) return
    try {
      await deleteEmpresa(item.id, token)
      await loadEmpresas()
      toast.success("Empresa eliminada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar la empresa")
    }
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / PAGE_SIZE)), [totalItems])
  const canPrev = page > 1
  const canNext = page < totalPages

  return {
    token,
    items,
    totalItems,
    loading,
    initialLoading,
    isFetching,
    saving,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    canPrev,
    canNext,
    open,
    setOpen,
    editingId,
    form,
    setForm,
    resetForm,
    onSubmit,
    onEdit,
    onDelete,
  }
}
