"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Empresa, FormState, Sucursal } from "../interfaces/sucursal.interface"
import {
  createSucursal,
  deleteSucursal,
  fetchEmpresasForSucursal,
  fetchSucursales,
  updateSucursal,
} from "../services/sucursal.service"
import { buildEmpresaMap, buildSucursalesCsv, downloadCsv, emptyForm } from "../utils/sucursal.utils"

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 350

export function useSucursalPage() {
  const token = useUserStore((s) => s.accessToken)

  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [detail, setDetail] = useState<Sucursal | null>(null)
  const [empresaFilter, setEmpresaFilter] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [rows, setRows] = useState<Sucursal[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)

  const empresaMap = useMemo(() => buildEmpresaMap(empresas), [empresas])
  const filteredRows = rows

  const loadSucursales = useCallback(async () => {
    if (!token) {
      setLoading(false)
      setInitialLoading(false)
      return
    }
    try {
      setLoading(true)
      setIsFetching(true)
      const response = await fetchSucursales(token, {
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        empresa: empresaFilter,
        activo: estadoFilter,
      })
      setRows(response.results)
      setTotalItems(response.count)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cargar sucursales")
    } finally {
      setLoading(false)
      setInitialLoading(false)
      setIsFetching(false)
    }
  }, [debouncedSearch, empresaFilter, estadoFilter, page, token])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1)
      setDebouncedSearch(search.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timeoutId)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [empresaFilter, estadoFilter])

  useEffect(() => {
    const loadEmpresas = async () => {
      if (!token) return
      try {
        const nextEmpresas = await fetchEmpresasForSucursal(token)
        setEmpresas(nextEmpresas)
        if (nextEmpresas[0]) {
          setForm((prev) => ({ ...prev, empresa: prev.empresa || String(nextEmpresas[0].id) }))
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar empresas")
      }
    }
    void loadEmpresas()
  }, [token])

  useEffect(() => {
    void loadSucursales()
  }, [loadSucursales])

  const resetForm = () => {
    setEditingId(null)
    setForm({
      ...emptyForm(),
      empresa: empresas[0] ? String(empresas[0].id) : "",
    })
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return

    const payload = {
      empresa: Number(form.empresa),
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      activo: form.activo,
    }

    try {
      setSaving(true)
      if (editingId) {
        await updateSucursal(editingId, token, payload)
        toast.success("Sucursal actualizada")
      } else {
        await createSucursal(token, payload)
        toast.success("Sucursal creada")
      }
      await loadSucursales()
      setOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar la sucursal")
    } finally {
      setSaving(false)
    }
  }

  const onEdit = (item: Sucursal) => {
    setEditingId(item.id)
    setForm({
      empresa: String(item.empresa),
      codigo: item.codigo,
      nombre: item.nombre,
      activo: item.activo,
    })
    setOpen(true)
  }

  const onDelete = async (item: Sucursal) => {
    if (!token || !window.confirm(`Eliminar sucursal "${item.nombre}"?`)) return
    try {
      await deleteSucursal(item.id, token)
      await loadSucursales()
      setDetail((prev) => (prev?.id === item.id ? null : prev))
      toast.success("Sucursal eliminada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar la sucursal")
    }
  }

  const onExport = () => {
    const lines = buildSucursalesCsv(filteredRows, empresaMap)
    downloadCsv("sucursales.csv", lines)
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / PAGE_SIZE)), [totalItems])
  const canPrev = page > 1
  const canNext = page < totalPages

  return {
    token,
    loading,
    initialLoading,
    isFetching,
    saving,
    open,
    setOpen,
    editingId,
    detail,
    setDetail,
    empresaFilter,
    setEmpresaFilter,
    estadoFilter,
    setEstadoFilter,
    search,
    setSearch,
    empresas,
    form,
    setForm,
    empresaMap,
    filteredRows,
    resetForm,
    onSubmit,
    onEdit,
    onDelete,
    onExport,
    page,
    setPage,
    totalItems,
    totalPages,
    canPrev,
    canNext,
  }
}

