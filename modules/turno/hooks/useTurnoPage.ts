"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Bloque, FormState, Turno, TurnoRow } from "../interfaces/turno.interface"
import { createBloqueTurno, createTurno, deleteBloqueTurno, deleteTurno, fetchTurnosData, updateTurno } from "../services/turno.service"
import { asArray, buildBloquesByTurno, buildBloquesPayload, buildTurnoRows, buildTurnosCsv, downloadCsv, emptyForm, filterTurnos, validateTurnoForm } from "../utils/turno.utils"

export function useTurnoPage() {
  const token = useUserStore((s) => s.accessToken)
  const [search, setSearch] = useState("")
  const [tipoFilter, setTipoFilter] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("")
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<TurnoRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [bloques, setBloques] = useState<Bloque[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)

  const loadData = async () => {
    if (!token) return
    const [t, b] = await fetchTurnosData(token)
    setTurnos(asArray(t) as Turno[])
    setBloques(asArray(b) as Bloque[])
  }

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        await loadData()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar turnos")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [token])

  const bloquesByTurno = useMemo(() => buildBloquesByTurno(bloques), [bloques])
  const rows = useMemo(() => buildTurnoRows(turnos, bloquesByTurno), [turnos, bloquesByTurno])
  const filteredRows = useMemo(() => filterTurnos(rows, search, tipoFilter, estadoFilter), [rows, search, tipoFilter, estadoFilter])

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
        const existentes = bloquesByTurno[editingId] || []
        await Promise.all(existentes.map((b) => deleteBloqueTurno(b.id, token)))
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
        const created = (await createTurno(token, turnoPayload)) as Turno
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

      await loadData()
      setOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar turno")
    } finally {
      setSaving(false)
    }
  }

  const onEdit = (row: TurnoRow) => {
    const bs = (bloquesByTurno[row.id] || []).sort((a, b) => a.orden - b.orden)
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
      await loadData()
      setDetail((prev) => (prev?.id === row.id ? null : prev))
      toast.success("Turno eliminado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar turno")
    }
  }

  const onExport = () => {
    const lines = buildTurnosCsv(filteredRows)
    downloadCsv("turnos.csv", lines)
  }

  return {
    token,
    search,
    setSearch,
    tipoFilter,
    setTipoFilter,
    estadoFilter,
    setEstadoFilter,
    open,
    setOpen,
    detail,
    setDetail,
    loading,
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
