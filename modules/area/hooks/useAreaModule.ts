"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Area, FormState, Sucursal } from "../interfaces/area"
import {
  createArea,
  deleteArea,
  fetchAreaCatalogs,
  fetchAreaParents,
  fetchAreas,
  updateArea,
} from "../services/area.service"
import { buildAreaPayload, emptyForm, filterParents } from "../utils/area"

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 350

export default function useAreaModule() {
  const token = useUserStore((s) => s.accessToken)

  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [empresas, setEmpresas] = useState<{ id: number; razon_social: string }[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [parentCandidates, setParentCandidates] = useState<Area[]>([])
  const [empresaId, setEmpresaId] = useState("")
  const [sucursalId, setSucursalId] = useState("")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [form, setForm] = useState<FormState>(emptyForm)

  const loadAreas = useCallback(async () => {
    if (!token) {
      setLoading(false)
      setInitialLoading(false)
      return
    }
    try {
      setLoading(true)
      setIsFetching(true)
      const response = await fetchAreas(token, {
        page,
        pageSize: PAGE_SIZE,
        empresa: empresaId,
        sucursal: sucursalId,
        search: debouncedSearch,
      })
      setAreas(response.results)
      setTotalItems(response.count)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cargar areas")
    } finally {
      setLoading(false)
      setInitialLoading(false)
      setIsFetching(false)
    }
  }, [debouncedSearch, empresaId, page, sucursalId, token])

  useEffect(() => {
    const loadCatalogs = async () => {
      if (!token) {
        setLoading(false)
        setInitialLoading(false)
        return
      }
      try {
        const data = await fetchAreaCatalogs(token)
        setEmpresas(data.empresas)
        setSucursales(data.sucursales)

        const firstEmpresa = data.empresas[0]?.id
        const firstSucursal = data.sucursales.find((x) => x.empresa === firstEmpresa)?.id || data.sucursales[0]?.id
        setEmpresaId(firstEmpresa ? String(firstEmpresa) : "")
        setSucursalId(firstSucursal ? String(firstSucursal) : "")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar areas")
      }
    }
    void loadCatalogs()
  }, [token])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1)
      setDebouncedSearch(search.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timeoutId)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [empresaId, sucursalId])

  useEffect(() => {
    void loadAreas()
  }, [loadAreas])

  useEffect(() => {
    const loadParents = async () => {
      if (!token || !sucursalId) {
        setParentCandidates([])
        return
      }
      try {
        const rows = await fetchAreaParents(token, sucursalId)
        setParentCandidates(rows)
      } catch {
        setParentCandidates([])
      }
    }
    void loadParents()
  }, [token, sucursalId])

  const sucursalesFiltradas = useMemo(() => {
    if (!empresaId) return sucursales
    return sucursales.filter((x) => x.empresa === Number(empresaId))
  }, [empresaId, sucursales])

  const areasFiltradas = areas

  const areaById = useMemo(() => {
    const merged = new Map<number, Area>()
    for (const item of parentCandidates) merged.set(item.id, item)
    for (const item of areas) merged.set(item.id, item)
    return Object.fromEntries(merged.entries())
  }, [areas, parentCandidates])

  const parentsDisponibles = useMemo(() => {
    if (!sucursalId) return []
    return filterParents(parentCandidates, sucursalId, form.tipo, editingId)
  }, [parentCandidates, sucursalId, form.tipo, editingId])

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm())
  }

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) resetForm()
  }

  const onEmpresaChange = (nextEmpresaId: string) => {
    setEmpresaId(nextEmpresaId)
    const firstSucursal = sucursales.find((x) => x.empresa === Number(nextEmpresaId))
    setSucursalId(firstSucursal ? String(firstSucursal.id) : "")
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token || !sucursalId) return

    try {
      setSaving(true)
      const payload = buildAreaPayload(form, sucursalId)

      if (editingId) {
        await updateArea(token, editingId, payload)
        toast.success("Area actualizada")
      } else {
        await createArea(token, payload)
        toast.success("Area registrada")
      }

      await loadAreas()
      setOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar el area")
    } finally {
      setSaving(false)
    }
  }

  const onEdit = (item: Area) => {
    setEditingId(item.id)
    setForm({
      codigo: item.codigo,
      nombre: item.nombre,
      tipo: item.tipo,
      parent: item.parent ? String(item.parent) : "",
      activo: item.activo,
    })
    setSucursalId(String(item.sucursal))
    const suc = sucursales.find((x) => x.id === item.sucursal)
    if (suc) setEmpresaId(String(suc.empresa))
    setOpen(true)
  }

  const onDelete = async (item: Area) => {
    if (!token || !window.confirm(`Eliminar area "${item.nombre}"?`)) return
    try {
      await deleteArea(token, item.id)
      await loadAreas()
      toast.success("Area eliminada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar el area")
    }
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
    editingId,
    empresas,
    sucursalesFiltradas,
    areasFiltradas,
    areaById,
    empresaId,
    sucursalId,
    search,
    setSearch,
    page,
    setPage,
    totalItems,
    totalPages,
    canPrev,
    canNext,
    form,
    parentsDisponibles,
    setForm,
    setSucursalId,
    onOpenChange,
    onEmpresaChange,
    onSubmit,
    onEdit,
    onDelete,
    resetForm,
  }
}

