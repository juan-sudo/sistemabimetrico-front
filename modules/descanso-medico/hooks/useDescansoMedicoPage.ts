"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Area, Descanso, DescansoForm, Personal, Sucursal } from "../interfaces/descanso-medico.interface"
import { createDescanso, fetchDescansoCatalogs, fetchDescansos, fetchPersonalesDescansoModal } from "../services/descanso-medico.service"
import { buildDescansoExportRows, defaultForm, SEARCH_DEBOUNCE_MS } from "../utils/descanso-medico.utils"

export function useDescansoMedicoPage() {
  const token = useUserStore((state) => state.accessToken)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [openCrearDescanso, setOpenCrearDescanso] = useState(false)
  const [perfilEmpleado, setPerfilEmpleado] = useState<Personal | null>(null)
  const [selectedPersonalId, setSelectedPersonalId] = useState<number | null>(null)
  const [busquedaPersonal, setBusquedaPersonal] = useState("")
  const [debouncedBusquedaPersonal, setDebouncedBusquedaPersonal] = useState("")
  const [busquedaEmpleadoModal, setBusquedaEmpleadoModal] = useState("")
  const [debouncedBusquedaEmpleadoModal, setDebouncedBusquedaEmpleadoModal] = useState("")
  const [filtroMotivo, setFiltroMotivo] = useState("")
  const [filtroFecha, setFiltroFecha] = useState("")
  const [sucursalId, setSucursalId] = useState("")
  const [areaId, setAreaId] = useState("")
  const [form, setForm] = useState<DescansoForm>(defaultForm)
  const [personalesModal, setPersonalesModal] = useState<Personal[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [descansos, setDescansos] = useState<Descanso[]>([])
  const rowsRequestIdRef = useRef(0)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedBusquedaPersonal(busquedaPersonal.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [busquedaPersonal])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedBusquedaEmpleadoModal(busquedaEmpleadoModal.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [busquedaEmpleadoModal])

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoading(false)
        setInitialLoading(false)
        return
      }

      try {
        setLoading(true)
        const [sucursalesList, areasList] = await fetchDescansoCatalogs(token)
        setSucursales(sucursalesList)
        setAreas(areasList)
        if (!sucursalId && sucursalesList[0]) setSucursalId(String(sucursalesList[0].id))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar descansos medicos")
      } finally {
        setLoading(false)
        setInitialLoading(false)
      }
    }

    void run()
  }, [token, sucursalId])

  useEffect(() => {
    if (!token || initialLoading) return

    const requestId = rowsRequestIdRef.current + 1
    rowsRequestIdRef.current = requestId

    const run = async () => {
      try {
        setLoading(true)
        setIsFetching(true)
        const rows = await fetchDescansos(token, {
          sucursalId,
          areaId,
          filtroMotivo,
          filtroFecha,
          busquedaPersonal: debouncedBusquedaPersonal,
        })
        if (rowsRequestIdRef.current !== requestId) return
        setDescansos(rows)
      } catch (err) {
        if (rowsRequestIdRef.current !== requestId) return
        toast.error(err instanceof Error ? err.message : "No se pudo cargar descansos medicos")
      } finally {
        if (rowsRequestIdRef.current === requestId) {
          setLoading(false)
          setIsFetching(false)
        }
      }
    }

    void run()
  }, [token, initialLoading, sucursalId, areaId, filtroMotivo, filtroFecha, debouncedBusquedaPersonal])

  useEffect(() => {
    if (!token || !openCrearDescanso) return

    const run = async () => {
      try {
        const rows = await fetchPersonalesDescansoModal(token, {
          sucursalId,
          search: debouncedBusquedaEmpleadoModal,
        })
        setPersonalesModal(rows)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar personal")
      }
    }

    void run()
  }, [token, openCrearDescanso, sucursalId, debouncedBusquedaEmpleadoModal])

  const personalMap = useMemo(() => Object.fromEntries(personalesModal.map((item) => [item.id, item])), [personalesModal])
  const selectedPersonal = selectedPersonalId ? personalMap[selectedPersonalId] : null
  const sucursalMap = useMemo(() => Object.fromEntries(sucursales.map((item) => [item.id, item.nombre])), [sucursales])
  const areaMap = useMemo(() => Object.fromEntries(areas.map((item) => [item.id, item.nombre])), [areas])

  const areasFiltradas = useMemo(() => {
    if (!sucursalId) return areas
    return areas.filter((item) => item.sucursal === Number(sucursalId))
  }, [areas, sucursalId])

  useEffect(() => {
    if (areaId && !areasFiltradas.some((item) => String(item.id) === areaId)) {
      setAreaId("")
    }
  }, [areaId, areasFiltradas])

  const exportRows = useMemo(() => buildDescansoExportRows(descansos), [descansos])

  const descargarExcel = () => {
    const headers = ["Nombres Completos", "DNI", "Motivo", "Fecha Inicio", "Fecha Fin", "Dias", "CITT", "Diagnostico", "Adjunto", "Nro Doc."]
    const lines = [
      headers.join(","),
      ...exportRows.map((item) =>
        [item.nombres, item.dni, item.motivo, item.fechaInicio, item.fechaFin, item.dias, item.citt, item.diagnostico, item.adjunto, item.nroDoc]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ]
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "descansos-medicos.csv"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const descargarPdf = () => {
    const rowsHtml = exportRows
      .map((item) => `<tr><td>${item.nombres}</td><td>${item.dni}</td><td>${item.motivo}</td><td>${item.fechaInicio}</td><td>${item.fechaFin}</td><td>${item.dias}</td><td>${item.citt}</td><td>${item.diagnostico}</td><td>${item.adjunto}</td><td>${item.nroDoc}</td></tr>`)
      .join("")
    const win = window.open("", "_blank", "width=1200,height=800")
    if (!win) return
    win.document.write(`<html><head><title>Descansos Medicos</title><style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #d1d5db;padding:6px}th{background:#65a30d;color:#fff}</style></head><body><h1>Reporte de Descansos Medicos</h1><table><thead><tr><th>Nombres</th><th>DNI</th><th>Motivo</th><th>Inicio</th><th>Fin</th><th>Dias</th><th>CITT</th><th>Diagnostico</th><th>Adjunto</th><th>Nro Doc.</th></tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`)
    win.document.close()
    win.print()
  }

  const reloadDescansos = async () => {
    if (!token) return
    const rows = await fetchDescansos(token, {
      sucursalId,
      areaId,
      filtroMotivo,
      filtroFecha,
      busquedaPersonal: debouncedBusquedaPersonal,
    })
    setDescansos(rows)
  }

  const guardar = async () => {
    if (!token || !selectedPersonalId || !form.motivo) return

    try {
      setSaving(true)
      await createDescanso(token, {
        personal: selectedPersonalId,
        motivo: form.motivo,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        dias: Number(form.dias || "1"),
        citt: form.citt.trim(),
        diagnostico: form.diagnostico.trim(),
        tiene_adjunto: form.tiene_adjunto,
        numero_documento: form.numero_documento.trim(),
      })
      await reloadDescansos()
      setForm(defaultForm)
      setOpenCrearDescanso(false)
      setSelectedPersonalId(null)
      toast.success("Descanso medico registrado")
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
    openCrearDescanso,
    setOpenCrearDescanso,
    perfilEmpleado,
    setPerfilEmpleado,
    selectedPersonalId,
    setSelectedPersonalId,
    busquedaPersonal,
    setBusquedaPersonal,
    busquedaEmpleadoModal,
    setBusquedaEmpleadoModal,
    filtroMotivo,
    setFiltroMotivo,
    filtroFecha,
    setFiltroFecha,
    sucursalId,
    setSucursalId,
    areaId,
    setAreaId,
    form,
    setForm,
    selectedPersonal,
    personalesModal,
    sucursales,
    areas,
    descansos,
    sucursalMap,
    areaMap,
    areasFiltradas,
    descargarExcel,
    descargarPdf,
    guardar,
  }
}
