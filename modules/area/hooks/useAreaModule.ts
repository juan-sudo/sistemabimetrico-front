"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Area, Empresa, FormState, Sucursal } from "../interfaces/area"
import { createArea, deleteArea, fetchAreaData, updateArea } from "../services/area.service"
import { buildAreaPayload, emptyForm, filterParents } from "../utils/area"

export default function useAreaModule() {
  const token = useUserStore((s) => s.accessToken)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [empresaId, setEmpresaId] = useState("")
  const [sucursalId, setSucursalId] = useState("")
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const data = await fetchAreaData(token)
        setEmpresas(data.empresas)
        setSucursales(data.sucursales)
        setAreas(data.areas)

        const firstEmpresa = data.empresas[0]?.id
        const firstSucursal = data.sucursales.find((x) => x.empresa === firstEmpresa)?.id || data.sucursales[0]?.id
        setEmpresaId(firstEmpresa ? String(firstEmpresa) : "")
        setSucursalId(firstSucursal ? String(firstSucursal) : "")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar areas")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token])

  const sucursalesFiltradas = useMemo(() => {
    if (!empresaId) return sucursales
    return sucursales.filter((x) => x.empresa === Number(empresaId))
  }, [empresaId, sucursales])

  const areasFiltradas = useMemo(() => {
    if (!sucursalId) return areas
    return areas.filter((x) => x.sucursal === Number(sucursalId))
  }, [areas, sucursalId])

  const areaById = useMemo(() => Object.fromEntries(areas.map((x) => [x.id, x])), [areas])

  const parentsDisponibles = useMemo(() => {
    if (!sucursalId) return []
    return filterParents(areas, sucursalId, form.tipo, editingId)
  }, [areas, sucursalId, form.tipo, editingId])

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
        const updated = await updateArea(token, editingId, payload)
        setAreas((prev) => prev.map((x) => (x.id === editingId ? updated : x)))
        toast.success("Area actualizada")
      } else {
        const created = await createArea(token, payload)
        setAreas((prev) => [created, ...prev])
        toast.success("Area registrada")
      }

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
      setAreas((prev) => prev.filter((x) => x.id !== item.id))
      toast.success("Area eliminada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar el area")
    }
  }

  return {
    token,
    loading,
    saving,
    open,
    editingId,
    empresas,
    sucursalesFiltradas,
    areasFiltradas,
    areaById,
    empresaId,
    sucursalId,
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
