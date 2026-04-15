"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Empresa, FormState, Sucursal } from "../interfaces/sucursal.interface"
import { createSucursal, deleteSucursal, fetchSucursalesData, updateSucursal } from "../services/sucursal.service"
import { asArray, buildEmpresaMap, buildSucursalesCsv, downloadCsv, emptyForm, filterSucursales } from "../utils/sucursal.utils"

export function useSucursalPage() {
  const token = useUserStore((s) => s.accessToken)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [detail, setDetail] = useState<Sucursal | null>(null)
  const [empresaFilter, setEmpresaFilter] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("")
  const [search, setSearch] = useState("")
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)

  const empresaMap = useMemo(() => buildEmpresaMap(empresas), [empresas])

  const filteredRows = useMemo(
    () => filterSucursales(sucursales, search, empresaFilter, estadoFilter),
    [sucursales, search, empresaFilter, estadoFilter]
  )

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const [e, s] = await fetchSucursalesData(token)
        const nextEmpresas = asArray(e) as Empresa[]
        const nextSucursales = asArray(s) as Sucursal[]
        setEmpresas(nextEmpresas)
        setSucursales(nextSucursales)
        if (nextEmpresas[0]) {
          setEmpresaFilter(String(nextEmpresas[0].id))
          setForm((prev) => ({ ...prev, empresa: String(nextEmpresas[0].id) }))
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar sucursales")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [token])

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
        const updated = (await updateSucursal(editingId, token, payload)) as Sucursal
        setSucursales((prev) => prev.map((x) => (x.id === editingId ? updated : x)))
        setDetail((prev) => (prev?.id === editingId ? updated : prev))
        toast.success("Sucursal actualizada")
      } else {
        const created = (await createSucursal(token, payload)) as Sucursal
        setSucursales((prev) => [created, ...prev])
        toast.success("Sucursal creada")
      }
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
      setSucursales((prev) => prev.filter((x) => x.id !== item.id))
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

  return {
    token,
    loading,
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
  }
}
