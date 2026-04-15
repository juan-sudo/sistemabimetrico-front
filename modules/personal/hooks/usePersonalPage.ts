"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Catalog, FormState, Personal } from "../interfaces/personal.interface"
import { createPersonal, deletePersonal, fetchPersonalCatalogs, fetchPersonalesPage, updatePersonal } from "../services/personal.service"
import { asArray, buildResetFormState, emptyForm } from "../utils/personal.utils"

type PaginatedResponse<T> = {
  count: number
  results: T[]
}

const PAGE_SIZE = 25

export function usePersonalPage() {
  const token = useUserStore((s) => s.accessToken)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [detail, setDetail] = useState<Personal | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Personal[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [empresaFilter, setEmpresaFilter] = useState("")
  const [sucursalFilter, setSucursalFilter] = useState("")
  const [areaFilter, setAreaFilter] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("")

  const [empresas, setEmpresas] = useState<Catalog[]>([])
  const [sucursales, setSucursales] = useState<Catalog[]>([])
  const [areas, setAreas] = useState<Catalog[]>([])
  const [ubicaciones, setUbicaciones] = useState<Catalog[]>([])
  const [tiposDoc, setTiposDoc] = useState<Catalog[]>([])
  const [tiposTrab, setTiposTrab] = useState<Catalog[]>([])
  const [categorias, setCategorias] = useState<Catalog[]>([])
  const [tiposSind, setTiposSind] = useState<Catalog[]>([])
  const [cargos, setCargos] = useState<Catalog[]>([])

  const formSucursales = useMemo(
    () => sucursales.filter((item) => !form.empresa || String(item.empresa) === form.empresa),
    [form.empresa, sucursales]
  )
  const formAreas = useMemo(
    () => areas.filter((item) => !form.sucursal || String(item.sucursal) === form.sucursal),
    [form.sucursal, areas]
  )

  useEffect(() => {
    if (!formSucursales.some((item) => String(item.id) === form.sucursal)) {
      setForm((prev) => ({ ...prev, sucursal: formSucursales[0] ? String(formSucursales[0].id) : "", area: "" }))
    }
  }, [form.sucursal, formSucursales])

  useEffect(() => {
    if (!formAreas.some((item) => String(item.id) === form.area)) {
      setForm((prev) => ({ ...prev, area: formAreas[0] ? String(formAreas[0].id) : "" }))
    }
  }, [form.area, formAreas])

  useEffect(() => {
    setPage(1)
  }, [search, empresaFilter, sucursalFilter, areaFilter, estadoFilter])

  const loadCatalogs = async () => {
    if (!token) return
    const [e, s, a, u, td, tt, c, ts, cg] = await fetchPersonalCatalogs(token)

    const nextEmpresas = asArray(e) as Catalog[]
    const nextSucursales = asArray(s) as Catalog[]
    const nextAreas = asArray(a) as Catalog[]
    const nextTiposDoc = asArray(td) as Catalog[]
    const nextTiposTrab = asArray(tt) as Catalog[]
    const nextCategorias = asArray(c) as Catalog[]

    setEmpresas(nextEmpresas)
    setSucursales(nextSucursales)
    setAreas(nextAreas)
    setUbicaciones(asArray(u) as Catalog[])
    setTiposDoc(nextTiposDoc)
    setTiposTrab(nextTiposTrab)
    setCategorias(nextCategorias)
    setTiposSind(asArray(ts) as Catalog[])
    setCargos(asArray(cg) as Catalog[])

    const empresa = nextEmpresas[0] ? String(nextEmpresas[0].id) : ""
    const sucursal = nextSucursales.find((item) => String(item.empresa) === empresa)
    const area = nextAreas.find((item) => String(item.sucursal) === String(sucursal?.id || ""))
    setForm((prev) => ({
      ...prev,
      empresa: prev.empresa || empresa,
      sucursal: prev.sucursal || (sucursal ? String(sucursal.id) : ""),
      area: prev.area || (area ? String(area.id) : ""),
      tipo_documento: prev.tipo_documento || String(nextTiposDoc[0]?.id || ""),
      tipo_trabajador: prev.tipo_trabajador || String(nextTiposTrab[0]?.id || ""),
      categoria: prev.categoria || String(nextCategorias[0]?.id || ""),
    }))
  }

  const loadRows = async () => {
    if (!token) return
    const response = (await fetchPersonalesPage(token, {
      page,
      pageSize: PAGE_SIZE,
      search,
      empresaFilter,
      sucursalFilter,
      areaFilter,
      estadoFilter,
    })) as PaginatedResponse<Personal> | Personal[]

    if (Array.isArray(response)) {
      setItems(response)
      setTotalItems(response.length)
      return
    }

    setItems(Array.isArray(response.results) ? response.results : [])
    setTotalItems(typeof response.count === "number" ? response.count : 0)
  }

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        await loadCatalogs()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar catalogos")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [token])

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        setLoading(true)
        await loadRows()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar personal")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [token, page, search, empresaFilter, sucursalFilter, areaFilter, estadoFilter])

  const resetForm = () => {
    setEditingId(null)
    setForm(
      buildResetFormState({
        empresas,
        sucursales,
        areas,
        tiposDoc,
        tiposTrab,
        categorias,
      })
    )
  }

  const onSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return
    if (!form.empresa || !form.sucursal || !form.area || !form.tipo_documento || !form.tipo_trabajador || !form.categoria) {
      toast.error("Completa los campos obligatorios.")
      return
    }

    const payload = {
      empresa: Number(form.empresa),
      sucursal: Number(form.sucursal),
      area: Number(form.area),
      ubicacion: form.ubicacion ? Number(form.ubicacion) : null,
      tipo_documento: Number(form.tipo_documento),
      tipo_trabajador: Number(form.tipo_trabajador),
      categoria: Number(form.categoria),
      tipo_sindicato: form.tipo_sindicato ? Number(form.tipo_sindicato) : null,
      cargo: form.cargo ? Number(form.cargo) : null,
      codigo_empleado: form.codigo_empleado.trim(),
      numero_documento: form.numero_documento.trim(),
      nombres_completos: form.nombres_completos.trim(),
      correo: form.correo.trim(),
      telefono: form.telefono.trim(),
      fecha_ingreso: form.fecha_ingreso || null,
      estado: form.estado,
    }

    try {
      setSaving(true)
      if (editingId) {
        const updated = (await updatePersonal(editingId, token, payload)) as Personal
        setDetail((prev) => (prev?.id === editingId ? updated : prev))
        toast.success("Personal actualizado")
      } else {
        await createPersonal(token, payload)
        toast.success("Personal creado")
      }
      await loadRows()
      setOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  const edit = (item: Personal) => {
    setEditingId(item.id)
    setForm({
      empresa: String(item.empresa),
      sucursal: String(item.sucursal),
      area: String(item.area),
      ubicacion: item.ubicacion ? String(item.ubicacion) : "",
      tipo_documento: String(item.tipo_documento),
      tipo_trabajador: String(item.tipo_trabajador),
      categoria: String(item.categoria),
      tipo_sindicato: item.tipo_sindicato ? String(item.tipo_sindicato) : "",
      cargo: item.cargo ? String(item.cargo) : "",
      codigo_empleado: item.codigo_empleado,
      numero_documento: item.numero_documento,
      nombres_completos: item.nombres_completos,
      correo: item.correo || "",
      telefono: item.telefono || "",
      fecha_ingreso: item.fecha_ingreso || "",
      estado: item.estado,
    })
    setOpen(true)
  }

  const remove = async (item: Personal) => {
    if (!token || !window.confirm(`Eliminar a ${item.nombres_completos}?`)) return
    try {
      await deletePersonal(item.id, token)
      setDetail((prev) => (prev?.id === item.id ? null : prev))
      await loadRows()
      toast.success("Personal eliminado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const canPrev = page > 1
  const canNext = page < totalPages

  return {
    token,
    search,
    setSearch,
    open,
    setOpen,
    editingId,
    detail,
    setDetail,
    saving,
    loading,
    form,
    setForm,
    empresaFilter,
    setEmpresaFilter,
    sucursalFilter,
    setSucursalFilter,
    areaFilter,
    setAreaFilter,
    estadoFilter,
    setEstadoFilter,
    empresas,
    sucursales,
    areas,
    ubicaciones,
    tiposDoc,
    tiposTrab,
    categorias,
    tiposSind,
    cargos,
    formSucursales,
    formAreas,
    filtered: items,
    totalItems,
    page,
    setPage,
    totalPages,
    canPrev,
    canNext,
    resetForm,
    onSave,
    edit,
    remove,
  }
}
