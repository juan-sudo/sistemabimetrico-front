"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Area, Bloque, FormState, Personal, PersonalTurno, Sucursal, Turno } from "../interfaces/horario-personal.interface"
import {
  createPersonalTurno,
  deletePersonalTurno,
  fetchHorarioPersonalCatalogs,
  fetchPersonalTurnosPage,
  updatePersonalTurno,
} from "../services/horario-personal.service"
import { asArray, buildBloquesByTurno, buildHorarioRows, emptyForm } from "../utils/horario-personal.utils"

type PaginatedResponse<T> = {
  count: number
  results: T[]
}

const PAGE_SIZE = 25

export function useHorarioPersonalPage() {
  const token = useUserStore((s) => s.accessToken)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [personales, setPersonales] = useState<Personal[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [bloques, setBloques] = useState<Bloque[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [asignaciones, setAsignaciones] = useState<PersonalTurno[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    setPage(1)
  }, [search])

  const loadCatalogs = async () => {
    if (!token) return
    const [p, t, b, a, s] = await fetchHorarioPersonalCatalogs(token)
    setPersonales(asArray(p) as Personal[])
    setTurnos(asArray(t) as Turno[])
    setBloques(asArray(b) as Bloque[])
    setAreas(asArray(a) as Area[])
    setSucursales(asArray(s) as Sucursal[])
  }

  const loadRows = async () => {
    if (!token) return
    const response = (await fetchPersonalTurnosPage(token, {
      page,
      pageSize: PAGE_SIZE,
      search,
    })) as PaginatedResponse<PersonalTurno> | PersonalTurno[]

    if (Array.isArray(response)) {
      setAsignaciones(response)
      setTotalItems(response.length)
      return
    }

    setAsignaciones(Array.isArray(response.results) ? response.results : [])
    setTotalItems(typeof response.count === "number" ? response.count : 0)
  }

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        await loadCatalogs()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar catalogos de horario")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [token])

  useEffect(() => {
    const run = async () => {
      if (!token) return
      try {
        setLoading(true)
        await loadRows()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar horarios por personal")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [token, page, search])

  const bloquesByTurno = useMemo(() => buildBloquesByTurno(bloques), [bloques])

  const rows = useMemo(
    () => buildHorarioRows({ asignaciones, personales, turnos, bloquesByTurno, areas, sucursales }),
    [asignaciones, personales, turnos, bloquesByTurno, areas, sucursales]
  )

  const selectedTurnoBlocks = useMemo(() => {
    const turnoId = Number(form.turno)
    if (!turnoId) return []
    return bloquesByTurno[turnoId] || []
  }, [form.turno, bloquesByTurno])

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
