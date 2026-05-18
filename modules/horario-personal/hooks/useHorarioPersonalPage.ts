"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { FormState, Personal, PersonalTurno, Turno } from "../interfaces/horario-personal.interface"
import {
  createPersonalTurno,
  deletePersonalTurno,
  fetchHorarioPersonalCatalogs,
  fetchPersonalTurnosPage,
  updatePersonalTurno,
} from "../services/horario-personal.service"
import { buildHorarioRows, emptyForm, getTurnoBlocks } from "../utils/horario-personal.utils"

const PAGE_SIZE = 25
const SEARCH_DEBOUNCE_MS = 350

export function useHorarioPersonalPage() {
  const token = useUserStore((s) => s.accessToken)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [personales, setPersonales] = useState<Personal[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [asignaciones, setAsignaciones] = useState<PersonalTurno[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1)
      setDebouncedSearch(search.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timeoutId)
  }, [search])

  const loadCatalogs = useCallback(async () => {
    if (!token) return
    const [p, t] = await fetchHorarioPersonalCatalogs(token)
    setPersonales(p)
    setTurnos(t)
  }, [token])

  const loadRows = useCallback(async () => {
    if (!token) return
    const response = await fetchPersonalTurnosPage(token, {
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch,
    })
    setAsignaciones(response.results)
    setTotalItems(response.count)
  }, [debouncedSearch, page, token])

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoading(false)
        setInitialLoading(false)
        return
      }
      try {
        setLoading(true)
        setIsFetching(true)
        await Promise.all([loadCatalogs(), loadRows()])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar horarios por personal")
      } finally {
        setLoading(false)
        setInitialLoading(false)
        setIsFetching(false)
      }
    }
    void run()
  }, [token, loadCatalogs, loadRows])

  const rows = useMemo(() => buildHorarioRows(asignaciones), [asignaciones])

  const selectedTurnoBlocks = useMemo(() => getTurnoBlocks(form.turno, turnos), [form.turno, turnos])

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm())
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return
    if (!form.personal || !form.turno || !form.fechaInicio) {
      toast.error("Personal, turno y fecha inicio son obligatorios.")
      return
    }

    const payload = {
      personal: Number(form.personal),
      turno: Number(form.turno),
      fecha_inicio: form.fechaInicio,
      fecha_fin: form.fechaFin || null,
      observacion: form.observacion.trim(),
    }

    try {
      setSaving(true)
      if (editingId) {
        await updatePersonalTurno(editingId, token, payload)
        toast.success("Horario por personal actualizado")
      } else {
        await createPersonalTurno(token, payload)
        toast.success("Horario por personal registrado")
      }
      await loadRows()
      setOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar la asignacion")
    } finally {
      setSaving(false)
    }
  }

  const onEdit = (row: PersonalTurno) => {
    setEditingId(row.id)
    setForm({
      personal: String(row.personal),
      turno: String(row.turno),
      fechaInicio: row.fecha_inicio,
      fechaFin: row.fecha_fin || "",
      observacion: row.observacion || "",
    })
    setOpen(true)
  }

  const onDelete = async (row: PersonalTurno) => {
    if (!token || !window.confirm("Eliminar este horario por personal?")) return
    try {
      await deletePersonalTurno(row.id, token)
      await loadRows()
      toast.success("Horario eliminado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
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
    search,
    setSearch,
    page,
    setPage,
    totalItems,
    totalPages,
    canPrev,
    canNext,
    editingId,
    personales,
    turnos,
    filteredRows: rows,
    selectedTurnoBlocks,
    form,
    setForm,
    resetForm,
    onSubmit,
    onEdit,
    onDelete,
  }
}

