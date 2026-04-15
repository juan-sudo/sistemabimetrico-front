"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Area, Marcacion, Personal, PersonalTurno, Turno, TurnoBloque } from "../interfaces/consultar-asistencia.interface"
import {
  fetchAreas,
  fetchMarcaciones,
  fetchPersonales,
  fetchPersonalTurnos,
  fetchTurnoBloques,
  fetchTurnos,
} from "../services/consultar-asistencia.service"
import { asArray, buildExportRows, buildRows, exportHeaders, formatInputDate, formatShortDate } from "../utils/consultar-asistencia.utils"

export function useConsultarAsistenciaPage() {
  const token = useUserStore((s) => s.accessToken)
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [loading, setLoading] = useState(false)
  const [fechaInicio, setFechaInicio] = useState(formatInputDate(firstDayOfMonth))
  const [fechaFin, setFechaFin] = useState(formatInputDate(today))
  const [selectedPersonalId, setSelectedPersonalId] = useState<number | null>(null)
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false)
  const [personalSearch, setPersonalSearch] = useState("")

  const [personales, setPersonales] = useState<Personal[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [marcaciones, setMarcaciones] = useState<Marcacion[]>([])
  const [asignaciones, setAsignaciones] = useState<PersonalTurno[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [bloques, setBloques] = useState<TurnoBloque[]>([])

  useEffect(() => {
    const loadBaseData = async () => {
      if (!token) return
      try {
        const [p, a, pt, t, b] = await Promise.all([
          fetchPersonales(token),
          fetchAreas(token),
          fetchPersonalTurnos(token),
          fetchTurnos(token),
          fetchTurnoBloques(token),
        ])
        setPersonales(asArray(p) as Personal[])
        setAreas(asArray(a) as Area[])
        setAsignaciones(asArray(pt) as PersonalTurno[])
        setTurnos(asArray(t) as Turno[])
        setBloques(asArray(b) as TurnoBloque[])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar datos base")
      }
    }
    void loadBaseData()
  }, [token])

  useEffect(() => {
    const loadMarcacionesData = async () => {
      if (!token) return
      if (!fechaInicio || !fechaFin || fechaInicio > fechaFin) {
        setMarcaciones([])
        return
      }

      setLoading(true)
      try {
        const response = await fetchMarcaciones(token, fechaInicio, fechaFin, selectedPersonalId)
        setMarcaciones(asArray(response) as Marcacion[])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar marcaciones")
      } finally {
        setLoading(false)
      }
    }
    void loadMarcacionesData()
  }, [token, fechaInicio, fechaFin, selectedPersonalId])

  const rows = useMemo(
    () =>
      buildRows({
        marcaciones,
        personales,
        areas,
        asignaciones,
        turnos,
        bloques,
      }),
    [marcaciones, personales, areas, asignaciones, turnos, bloques]
  )

  const selectedPersonal = useMemo(
    () => (selectedPersonalId ? personales.find((item) => item.id === selectedPersonalId) || null : null),
    [personales, selectedPersonalId]
  )

  const selectedLabel = selectedPersonal
    ? `${selectedPersonal.numero_documento} - ${selectedPersonal.nombres_completos}`
    : "Todos los trabajadores"

  const modalPersonales = useMemo(() => {
    const term = personalSearch.trim().toLowerCase()
    if (!term) return personales
    return personales.filter((item) => `${item.numero_documento} ${item.nombres_completos}`.toLowerCase().includes(term))
  }, [personales, personalSearch])

  const exportRows = useMemo(() => buildExportRows(rows), [rows])

  const handleExportExcel = () => {
    const lines = [
      exportHeaders.map((item) => `"${item}"`).join(","),
      ...exportRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ]
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `consultar-asistencia-${fechaInicio}-${fechaFin}.csv`
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
          <p>Periodo: ${fechaInicio} a ${fechaFin} | Registros: ${exportRows.length}</p>
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
        total_registros: rows.length,
      },
      registros: rows,
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `consultar-asistencia-raw-${fechaInicio}-${fechaFin}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    token,
    loading,
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
    exportHeaders,
    formatShortDate,
    handleExportExcel,
    handleExportPdf,
    handleExportRawJson,
  }
}
