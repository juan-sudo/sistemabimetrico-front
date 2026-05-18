"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Area, Justificacion, JustificacionForm, Personal, Sucursal } from "../interfaces/justificacion.interface"
import {
  createJustificacion,
  fetchJustificacionCatalogs,
  fetchJustificaciones,
  fetchPersonalesForModal,
} from "../services/justificacion.service"
import { defaultForm } from "../utils/justificacion.utils"

const SEARCH_DEBOUNCE_MS = 350

export function useJustificacionPage() {
  const token = useUserStore((s) => s.accessToken)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [openCrear, setOpenCrear] = useState(false)
  const [busquedaGeneral, setBusquedaGeneral] = useState("")
  const [debouncedBusquedaGeneral, setDebouncedBusquedaGeneral] = useState("")
  const [filtroMotivo, setFiltroMotivo] = useState("")
  const [debouncedFiltroMotivo, setDebouncedFiltroMotivo] = useState("")
  const [filtroFecha, setFiltroFecha] = useState("")
  const [sucursalId, setSucursalId] = useState("")
  const [areaId, setAreaId] = useState("")
  const [busquedaEmpleado, setBusquedaEmpleado] = useState("")
  const [debouncedBusquedaEmpleado, setDebouncedBusquedaEmpleado] = useState("")
  const [selectedPersonalId, setSelectedPersonalId] = useState<number | null>(null)
  const [form, setForm] = useState<JustificacionForm>(defaultForm)
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState<Personal[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [justificaciones, setJustificaciones] = useState<Justificacion[]>([])
  const [detailRow, setDetailRow] = useState<Justificacion | null>(null)
  const justificacionesRequestIdRef = useRef(0)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedBusquedaGeneral(busquedaGeneral.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [busquedaGeneral])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedFiltroMotivo(filtroMotivo.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [filtroMotivo])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedBusquedaEmpleado(busquedaEmpleado.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [busquedaEmpleado])

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoading(false)
        setInitialLoading(false)
        return
      }
      try {
        const [sList, aList] = await fetchJustificacionCatalogs(token)
        setSucursales(sList)
        setAreas(aList)
        if (!sucursalId && sList[0]) setSucursalId(String(sList[0].id))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar catalogos")
      } finally {
        setInitialLoading(false)
      }
    }
    void run()
  }, [token, sucursalId])

  useEffect(() => {
    const run = async () => {
      if (!token) return

      const requestId = justificacionesRequestIdRef.current + 1
      justificacionesRequestIdRef.current = requestId

      try {
        setLoading(true)
        setIsFetching(true)
        const rows = await fetchJustificaciones(token, {
          sucursalId,
          areaId,
          filtroMotivo: debouncedFiltroMotivo,
          filtroFecha,
          busquedaGeneral: debouncedBusquedaGeneral,
        })
        if (justificacionesRequestIdRef.current !== requestId) return
        setJustificaciones(rows)
      } catch (err) {
        if (justificacionesRequestIdRef.current !== requestId) return
        toast.error(err instanceof Error ? err.message : "No se pudo cargar justificaciones")
      } finally {
        if (justificacionesRequestIdRef.current === requestId) {
          setLoading(false)
          setIsFetching(false)
        }
      }
    }
    void run()
  }, [token, sucursalId, areaId, filtroFecha, debouncedFiltroMotivo, debouncedBusquedaGeneral])

  useEffect(() => {
    if (!token || !openCrear) return

    const run = async () => {
      try {
        const rows = await fetchPersonalesForModal(token, {
          sucursalId,
          search: debouncedBusquedaEmpleado,
        })
        setEmpleadosFiltrados(rows)

        if (selectedPersonalId && !rows.some((item) => item.id === selectedPersonalId)) {
          setSelectedPersonalId(null)
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar personal")
      }
    }
    void run()
  }, [token, openCrear, sucursalId, debouncedBusquedaEmpleado, selectedPersonalId])

  const sucursalMap = useMemo(() => Object.fromEntries(sucursales.map((x) => [x.id, x.nombre])), [sucursales])
  const areaMap = useMemo(() => Object.fromEntries(areas.map((x) => [x.id, x.nombre])), [areas])
  const personalMap = useMemo(() => Object.fromEntries(empleadosFiltrados.map((x) => [x.id, x])), [empleadosFiltrados])

  const areasFiltradas = useMemo(() => {
    if (!sucursalId) return areas
    return areas.filter((x) => x.sucursal === Number(sucursalId))
  }, [areas, sucursalId])

  const justificacionesFiltradas = justificaciones

  const exportRows = useMemo(
    () =>
      justificacionesFiltradas.map((j) => ({
        nombres: j.personal_nombres_completos || personalMap[j.personal]?.nombres_completos || "-",
        dni: j.personal_numero_documento || personalMap[j.personal]?.numero_documento || "-",
        motivo: j.motivo,
        tipo: j.tipo,
        fechaInicio: j.fecha_inicio,
        fechaFin: j.fecha_fin,
        dias: j.dias,
        nombreDoc: j.nombre_documento || "-",
        estado: j.estado,
      })),
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

      const rows = await fetchJustificaciones(token, {
        sucursalId,
        areaId,
        filtroMotivo: debouncedFiltroMotivo,
        filtroFecha,
        busquedaGeneral: debouncedBusquedaGeneral,
      })
      setJustificaciones(rows)

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
    loading: loading || initialLoading,
    isFetching,
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
