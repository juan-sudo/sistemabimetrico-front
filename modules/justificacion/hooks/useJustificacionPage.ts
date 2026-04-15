"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Area, Justificacion, JustificacionForm, Personal, Sucursal } from "../interfaces/justificacion.interface"
import { createJustificacion, fetchJustificacionData } from "../services/justificacion.service"
import { asArray, defaultForm } from "../utils/justificacion.utils"

export function useJustificacionPage() {
  const token = useUserStore((s) => s.accessToken)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openCrear, setOpenCrear] = useState(false)
  const [busquedaGeneral, setBusquedaGeneral] = useState("")
  const [filtroMotivo, setFiltroMotivo] = useState("")
  const [filtroFecha, setFiltroFecha] = useState("")
  const [sucursalId, setSucursalId] = useState("")
  const [areaId, setAreaId] = useState("")
  const [busquedaEmpleado, setBusquedaEmpleado] = useState("")
  const [selectedPersonalId, setSelectedPersonalId] = useState<number | null>(null)
  const [form, setForm] = useState<JustificacionForm>(defaultForm)
  const [personales, setPersonales] = useState<Personal[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [justificaciones, setJustificaciones] = useState<Justificacion[]>([])
  const [detailRow, setDetailRow] = useState<Justificacion | null>(null)

  const loadData = async () => {
    if (!token) return
    const [p, s, a, j] = await fetchJustificacionData(token)
    const pList = asArray(p) as Personal[]
    const sList = asArray(s) as Sucursal[]
    const aList = asArray(a) as Area[]
    const jList = asArray(j) as Justificacion[]
    setPersonales(pList)
    setSucursales(sList)
    setAreas(aList)
    setJustificaciones(jList)
    if (!sucursalId && sList[0]) setSucursalId(String(sList[0].id))
    if (!areaId && aList[0]) setAreaId(String(aList[0].id))
  }

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        await loadData()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar justificaciones")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [token])

  const sucursalMap = useMemo(() => Object.fromEntries(sucursales.map((x) => [x.id, x.nombre])), [sucursales])
  const areaMap = useMemo(() => Object.fromEntries(areas.map((x) => [x.id, x.nombre])), [areas])
  const personalMap = useMemo(() => Object.fromEntries(personales.map((x) => [x.id, x])), [personales])

  const areasFiltradas = useMemo(() => {
    if (!sucursalId) return areas
    return areas.filter((x) => x.sucursal === Number(sucursalId))
  }, [areas, sucursalId])

  const empleadosFiltrados = useMemo(() => {
    const q = busquedaEmpleado.trim().toLowerCase()
    const base = personales.filter((p) => !sucursalId || p.sucursal === Number(sucursalId))
    if (!q) return base
    return base.filter((p) => `${p.nombres_completos} ${p.numero_documento}`.toLowerCase().includes(q))
  }, [personales, busquedaEmpleado, sucursalId])

  const justificacionesFiltradas = useMemo(() => {
    return justificaciones.filter((j) => {
      const p = personalMap[j.personal]
      if (!p) return false
      if (sucursalId && j.sucursal !== Number(sucursalId)) return false
      if (areaId && j.area !== Number(areaId)) return false
      if (filtroMotivo && !j.motivo.toLowerCase().includes(filtroMotivo.toLowerCase())) return false
      if (filtroFecha && j.fecha_inicio !== filtroFecha) return false
      if (busquedaGeneral) {
        const t = busquedaGeneral.toLowerCase()
        const ok = `${p.nombres_completos} ${p.numero_documento} ${areaMap[j.area] || ""}`.toLowerCase().includes(t)
        if (!ok) return false
      }
      return true
    })
  }, [justificaciones, personalMap, sucursalId, areaId, filtroMotivo, filtroFecha, busquedaGeneral, areaMap])

  const exportRows = useMemo(
    () =>
      justificacionesFiltradas.map((j) => {
        const p = personalMap[j.personal]
        return {
          nombres: p?.nombres_completos || "-",
          dni: p?.numero_documento || "-",
          motivo: j.motivo,
          tipo: j.tipo,
          fechaInicio: j.fecha_inicio,
          fechaFin: j.fecha_fin,
          dias: j.dias,
          nombreDoc: j.nombre_documento || "-",
          estado: j.estado,
        }
      }),
    [justificacionesFiltradas, personalMap]
  )

  const descargarExcel = () => {
    const headers = ["Nombres Completos", "DNI", "Motivo", "Tipo", "Fecha Inicio", "Fecha Fin", "Dias", "Nombre Doc.", "Estado"]
    const lines = [
      headers.join(","),
      ...exportRows.map((x) =>
        [x.nombres, x.dni, x.motivo, x.tipo, x.fechaInicio, x.fechaFin, x.dias, x.nombreDoc, x.estado]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ]
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "justificaciones.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const descargarPdf = () => {
    const rowsHtml = exportRows
      .map((x) => `<tr><td>${x.nombres}</td><td>${x.dni}</td><td>${x.motivo}</td><td>${x.tipo}</td><td>${x.fechaInicio}</td><td>${x.fechaFin}</td><td>${x.dias}</td><td>${x.nombreDoc}</td><td>${x.estado}</td></tr>`)
      .join("")
    const w = window.open("", "_blank", "width=1200,height=800")
    if (!w) return
    w.document.write(`<html><head><title>Justificaciones</title><style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #d1d5db;padding:6px}th{background:#65a30d;color:#fff}</style></head><body><h1>Reporte de Justificaciones</h1><table><thead><tr><th>Nombres</th><th>DNI</th><th>Motivo</th><th>Tipo</th><th>Inicio</th><th>Fin</th><th>Dias</th><th>Nombre Doc.</th><th>Estado</th></tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`)
    w.document.close()
    w.print()
  }

  const guardar = async () => {
    if (!token || !selectedPersonalId) return
    const personal = personalMap[selectedPersonalId]
    if (!personal || !form.motivo.trim()) return
    try {
      setSaving(true)
      await createJustificacion(token, {
        personal: personal.id,
        sucursal: personal.sucursal,
        area: personal.area,
        motivo: form.motivo.trim(),
        tipo: form.tipo,
        rango: form.rango,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        dias: Number(form.dias || "1"),
        descripcion: form.descripcion.trim(),
        tiene_adjunto: form.tiene_adjunto,
        numero_documento: form.numero_documento.trim(),
        nombre_documento: form.nombre_documento.trim(),
        estado: "PENDIENTE",
        motivo_no_autorizacion: "",
      })
      await loadData()
      setOpenCrear(false)
      setSelectedPersonalId(null)
      setForm(defaultForm)
      toast.success("Justificacion registrada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  return {
    token,
    loading,
    saving,
    openCrear,
    setOpenCrear,
    busquedaGeneral,
    setBusquedaGeneral,
    filtroMotivo,
    setFiltroMotivo,
    filtroFecha,
    setFiltroFecha,
    sucursalId,
    setSucursalId,
    areaId,
    setAreaId,
    busquedaEmpleado,
    setBusquedaEmpleado,
    selectedPersonalId,
    setSelectedPersonalId,
    form,
    setForm,
    personales,
    sucursales,
    areas,
    detailRow,
    setDetailRow,
    sucursalMap,
    areaMap,
    personalMap,
    areasFiltradas,
    empleadosFiltrados,
    justificacionesFiltradas,
    descargarExcel,
    descargarPdf,
    guardar,
  }
}
