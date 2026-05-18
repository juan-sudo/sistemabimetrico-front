"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Area, Marcacion, Personal, PersonalTurno, Turno, TurnoBloque } from "../interfaces/consultar-asistencia.interface"
import {
  fetchAreas,
  fetchJustificacionesRange,
  fetchMarcacionesPage,
  fetchPersonalesPage,
  fetchPersonalTurnos,
  fetchTurnoBloques,
  fetchTurnos,
} from "../services/consultar-asistencia.service"
import { asArray, buildExportRows, buildRows, exportHeaders, formatInputDate, formatShortDate } from "../utils/consultar-asistencia.utils"
import type { JustificacionLite } from "../interfaces/consultar-asistencia.interface"

const PAGE_SIZE = 100
const PERSONAL_MODAL_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300

export function useConsultarAsistenciaPage() {
  const token = useUserStore((s) => s.accessToken)
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [fechaInicio, setFechaInicio] = useState(formatInputDate(firstDayOfMonth))
  const [fechaFin, setFechaFin] = useState(formatInputDate(today))
  const [selectedPersonalId, setSelectedPersonalId] = useState<number | null>(null)
  const [selectedPersonal, setSelectedPersonal] = useState<Personal | null>(null)
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false)
  const [personalSearch, setPersonalSearch] = useState("")
  const [debouncedPersonalSearch, setDebouncedPersonalSearch] = useState("")

  const [modalPersonales, setModalPersonales] = useState<Personal[]>([])
  const [modalPage, setModalPage] = useState(1)
  const [modalTotalItems, setModalTotalItems] = useState(0)
  const [modalLoading, setModalLoading] = useState(false)

  const [marcaciones, setMarcaciones] = useState<Marcacion[]>([])
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [areas, setAreas] = useState<Area[]>([])
  const [asignaciones, setAsignaciones] = useState<PersonalTurno[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [bloques, setBloques] = useState<TurnoBloque[]>([])
  const [justificaciones, setJustificaciones] = useState<JustificacionLite[]>([])

  const requestIdRef = useRef(0)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setModalPage(1)
      setDebouncedPersonalSearch(personalSearch.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [personalSearch])

  useEffect(() => {
    setPage(1)
  }, [fechaInicio, fechaFin, selectedPersonalId])

  useEffect(() => {
    const loadBaseData = async () => {
      if (!token) {
        setInitialLoading(false)
        return
      }
      try {
        const [a, pt, t, b] = await Promise.all([
          fetchAreas(token),
          fetchPersonalTurnos(token),
          fetchTurnos(token),
          fetchTurnoBloques(token),
        ])
        setAreas(asArray(a) as Area[])
        setAsignaciones(asArray(pt) as PersonalTurno[])
        setTurnos(asArray(t) as Turno[])
        setBloques(asArray(b) as TurnoBloque[])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar datos base")
      } finally {
        setInitialLoading(false)
      }
    }
    void loadBaseData()
  }, [token])

  useEffect(() => {
    if (!token || !isPersonalModalOpen) return

    const loadModalPersonales = async () => {
      try {
        setModalLoading(true)
        const response = await fetchPersonalesPage(token, {
          page: modalPage,
          pageSize: PERSONAL_MODAL_PAGE_SIZE,
          search: debouncedPersonalSearch,
        })
        setModalPersonales(response.results)
        setModalTotalItems(response.count)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar trabajadores")
      } finally {
        setModalLoading(false)
      }
    }

    void loadModalPersonales()
  }, [token, isPersonalModalOpen, modalPage, debouncedPersonalSearch])

  useEffect(() => {
    const loadMarcacionesData = async () => {
      if (!token) return
      if (!fechaInicio || !fechaFin || fechaInicio > fechaFin) {
        setMarcaciones([])
        setTotalItems(0)
        return
      }

      const requestId = requestIdRef.current + 1
      requestIdRef.current = requestId

      setLoading(true)
      setIsFetching(true)
      try {
        const response = await fetchMarcacionesPage(token, {
          page,
          pageSize: PAGE_SIZE,
          fechaInicio,
          fechaFin,
          personalId: selectedPersonalId,
        })

        if (requestIdRef.current !== requestId) return
        setMarcaciones(response.results)
        setTotalItems(response.count)
      } catch (err) {
        if (requestIdRef.current !== requestId) return
        toast.error(err instanceof Error ? err.message : "No se pudo cargar marcaciones")
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false)
          setIsFetching(false)
        }
      }
    }
    void loadMarcacionesData()
  }, [token, fechaInicio, fechaFin, selectedPersonalId, page])

  useEffect(() => {
    const loadJustificaciones = async () => {
      if (!token) return
      if (!fechaInicio || !fechaFin || fechaInicio > fechaFin) {
        setJustificaciones([])
        return
      }
      try {
        const rows = await fetchJustificacionesRange(token, {
          fechaInicio,
          fechaFin,
          personalId: selectedPersonalId,
        })
        setJustificaciones(rows)
      } catch (err) {
        // No bloquear el módulo si falla este extra
        toast.error(err instanceof Error ? err.message : "No se pudo cargar justificaciones para el periodo")
      }
    }
    void loadJustificaciones()
  }, [token, fechaInicio, fechaFin, selectedPersonalId])

  const rows = useMemo(
    () =>
      buildRows({
        marcaciones,
        personales: selectedPersonal ? [selectedPersonal] : [],
        areas,
        asignaciones,
        turnos,
        bloques,
        justificaciones,
      }),
    [marcaciones, selectedPersonal, areas, asignaciones, turnos, bloques, justificaciones]
  )

  const selectedLabel = selectedPersonal
    ? `${selectedPersonal.numero_documento} - ${selectedPersonal.nombres_completos}`
    : "Todos los trabajadores"

  const exportRows = useMemo(() => buildExportRows(rows), [rows])

  const handleSelectPersonal = (personal: Personal) => {
    setSelectedPersonalId(personal.id)
    setSelectedPersonal(personal)
    setIsPersonalModalOpen(false)
  }

  const handleClearPersonal = () => {
    setSelectedPersonalId(null)
    setSelectedPersonal(null)
    setIsPersonalModalOpen(false)
  }

  const handleExportExcel = () => {
    const lines = [
      exportHeaders.map((item) => `"${item}"`).join(","),
      ...exportRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ]
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `consultar-asistencia-${fechaInicio}-${fechaFin}-pag-${page}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPdf = () => {
    const htmlRows = exportRows.map((row) => `<tr>${row.map((cell) => `<td>${String(cell)}</td>`).join("")}</tr>`).join("")
    const win = window.open("", "_blank", "width=1400,height=900")
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Consultar asistencia ${fechaInicio} a ${fechaFin}</title>
          <style>
            @page { size: A4 landscape; margin: 8mm; }
            body { font-family: "Segoe UI", Tahoma, sans-serif; padding: 12px; color: #0f172a; }
            h1 { margin: 0 0 6px; font-size: 22px; }
            p { margin: 0 0 12px; color: #475569; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #cbd5e1; padding: 4px 6px; font-size: 9px; white-space: nowrap; }
            th { background: #0f766e; color: white; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Consultar asistencia</h1>
          <p>Periodo: ${fechaInicio} a ${fechaFin} | Pagina: ${page} | Registros: ${exportRows.length}</p>
          <table>
            <thead><tr>${exportHeaders.map((item) => `<th>${item}</th>`).join("")}</tr></thead>
            <tbody>${htmlRows}</tbody>
          </table>
          <script>window.onload = function () { window.print(); };</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  const handleExportRawJson = () => {
    if (rows.length === 0) {
      toast.error("No hay marcaciones en ese filtro.")
      return
    }

    const payload = {
      metadata: {
        generado_en: new Date().toISOString(),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        trabajador: selectedLabel,
        pagina: page,
        total_registros_pagina: rows.length,
        total_registros: totalItems,
      },
      registros: rows,
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `consultar-asistencia-raw-${fechaInicio}-${fechaFin}-pag-${page}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const canPrev = page > 1
  const canNext = page < totalPages

  const modalTotalPages = Math.max(1, Math.ceil(modalTotalItems / PERSONAL_MODAL_PAGE_SIZE))
  const modalCanPrev = modalPage > 1
  const modalCanNext = modalPage < modalTotalPages

  return {
    token,
    loading,
    initialLoading,
    isFetching,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    selectedPersonalId,
    setSelectedPersonalId,
    isPersonalModalOpen,
    setIsPersonalModalOpen,
    personalSearch,
    setPersonalSearch,
    selectedLabel,
    rows,
    modalPersonales,
    modalLoading,
    modalPage,
    setModalPage,
    modalTotalPages,
    modalCanPrev,
    modalCanNext,
    totalItems,
    page,
    setPage,
    totalPages,
    canPrev,
    canNext,
    exportHeaders,
    formatShortDate,
    handleSelectPersonal,
    handleClearPersonal,
    handleExportExcel,
    handleExportPdf,
    handleExportRawJson,
  }
}
