"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { FormState, Turno, TurnoRow } from "../interfaces/turno.interface"
import {
  createBloqueTurno,
  createTurno,
  deleteBloqueTurno,
  deleteTurno,
  fetchTurnos,
  updateTurno,
} from "../services/turno.service"
import { buildBloquesPayload, buildTurnosCsv, downloadCsv, emptyForm, validateTurnoForm } from "../utils/turno.utils"

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 350

function toTurnoRows(turnos: Turno[]): TurnoRow[] {
  return turnos.map((item) => {
    const bloques = (item.bloques_detalle || []).slice().sort((a, b) => a.orden - b.orden)
    return {
      ...item,
      entrada: bloques.map((x) => x.hora_entrada.slice(0, 5)).join(" / "),
      salida: bloques.map((x) => x.hora_salida.slice(0, 5)).join(" / "),
    }
  })
}

export function useTurnoPage() {
  const token = useUserStore((s) => s.accessToken)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [tipoFilter, setTipoFilter] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("")
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<TurnoRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [rows, setRows] = useState<TurnoRow[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [form, setForm] = useState<FormState>(emptyForm)

  const loadTurnos = useCallback(async () => {
    if (!token) {
      setLoading(false)
      setInitialLoading(false)
      return
    }
    try {
      setLoading(true)
      setIsFetching(true)
      const response = await fetchTurnos(token, {
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        tipo: tipoFilter,
        estado: estadoFilter,
      })
      setRows(toTurnoRows(response.results))
      setTotalItems(response.count)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cargar turnos")
    } finally {
      setLoading(false)
      setInitialLoading(false)
      setIsFetching(false)
    }
  }, [debouncedSearch, estadoFilter, page, tipoFilter, token])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1)
      setDebouncedSearch(search.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timeoutId)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [tipoFilter, estadoFilter])

  useEffect(() => {
    void loadTurnos()
  }, [loadTurnos])

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm())
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return

    const error = validateTurnoForm(form)
    if (error) {
      toast.error(error)
      return
    }

    const turnoPayload = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      activo: form.activo,
    }
    const bloquesPayload = buildBloquesPayload(form)

    try {
      setSaving(true)
      if (editingId) {
        await updateTurno(editingId, token, turnoPayload)
        const existing = rows.find((x) => x.id === editingId)?.bloques_detalle || []
        await Promise.all(existing.map((b) => deleteBloqueTurno(b.id, token)))
        await Promise.all(
          bloquesPayload.map((b) =>
            createBloqueTurno(token, {
              ...b,
              turno: editingId,
            })
          )
        )
        toast.success("Turno actualizado")
      } else {
        const created = await createTurno(token, turnoPayload)
        await Promise.all(
          bloquesPayload.map((b) =>
            createBloqueTurno(token, {
              ...b,
              turno: created.id,
            })
          )
        )
        toast.success("Turno creado")
      }

      await loadTurnos()
      setOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar turno")
    } finally {
      setSaving(false)
    }
  }

  const onEdit = (row: TurnoRow) => {
    const bs = (row.bloques_detalle || []).slice().sort((a, b) => a.orden - b.orden)
    setEditingId(row.id)
    setForm({
      codigo: row.codigo,
      nombre: row.nombre,
      tipo: row.tipo,
      activo: row.activo,
      entrada1: bs[0]?.hora_entrada?.slice(0, 5) || "",
      salida1: bs[0]?.hora_salida?.slice(0, 5) || "",
      entrada2: bs[1]?.hora_entrada?.slice(0, 5) || "",
      salida2: bs[1]?.hora_salida?.slice(0, 5) || "",
    })
    setOpen(true)
  }

  const onDelete = async (row: Turno) => {
    if (!token || !window.confirm(`Eliminar turno "${row.nombre}"?`)) return
    try {
      await deleteTurno(row.id, token)
      setDetail((prev) => (prev?.id === row.id ? null : prev))
      await loadTurnos()
      toast.success("Turno eliminado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar turno")
    }
  }

  const onExport = () => {
    const lines = buildTurnosCsv(rows)
    downloadCsv("turnos.csv", lines)
  }

  const filteredRows = rows
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / PAGE_SIZE)), [totalItems])
  const canPrev = page > 1
  const canNext = page < totalPages

  return {
    token,
    search,
    setSearch,
    tipoFilter,
    setTipoFilter,
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

