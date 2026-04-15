"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Empresa, EmpresaFormState } from "../interfaces/empresa.interface"
import { createEmpresa, deleteEmpresa, fetchEmpresas, updateEmpresa } from "../services/empresa.service"
import { emptyEmpresaForm, toEmpresaPayload } from "../utils/empresa.utils"

type EmpresaListResponse = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: Empresa[]
}

const PAGE_SIZE = 25

export function useEmpresaPage() {
  const token = useUserStore((s) => s.accessToken)

  const [items, setItems] = useState<Empresa[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<EmpresaFormState>(emptyEmpresaForm)

  const loadEmpresas = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = (await fetchEmpresas(token, {
        page,
        pageSize: PAGE_SIZE,
        search,
      })) as EmpresaListResponse | Empresa[]

      if (Array.isArray(data)) {
        setItems(data)
        setTotalItems(data.length)
        return
      }

      const rows = Array.isArray(data.results) ? data.results : []
      setItems(rows)
      setTotalItems(typeof data.count === "number" ? data.count : rows.length)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cargar empresas")
    } finally {
      setLoading(false)
    }
  }, [page, search, token])

  useEffect(() => {
    void loadEmpresas()
  }, [loadEmpresas])

  useEffect(() => {
    setPage(1)
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
