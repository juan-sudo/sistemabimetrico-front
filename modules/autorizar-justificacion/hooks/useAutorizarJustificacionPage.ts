"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { FiltroEstado, Justificacion, Area, Sucursal } from "../interfaces/autorizar-justificacion.interface"
import {
  fetchAutorizarJustificacionCatalogs,
  fetchAutorizarJustificaciones,
  gestionarJustificaciones,
} from "../services/autorizar-justificacion.service"
import { buildAutorizarExportRows } from "../utils/autorizar-justificacion.utils"

export function useAutorizarJustificacionPage() {
  const token = useUserStore((state) => state.accessToken)
  const [loading, setLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [rows, setRows] = useState<Justificacion[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [sucursal, setSucursal] = useState("")
  const [area, setArea] = useState("")
  const [mes, setMes] = useState("")
  const [anio, setAnio] = useState(String(new Date().getFullYear()))
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("TODOS")
  const [openAutorizarModal, setOpenAutorizarModal] = useState(false)
  const [openNoAutorizarModal, setOpenNoAutorizarModal] = useState(false)
  const [descripcionNoAutorizado, setDescripcionNoAutorizado] = useState("")
  const [detailRow, setDetailRow] = useState<Justificacion | null>(null)
  const [initialLoaded, setInitialLoaded] = useState(false)

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [sucursalesList, areasList] = await fetchAutorizarJustificacionCatalogs(token)
        setSucursales(sucursalesList)
        setAreas(areasList)
        if (!sucursal && sucursalesList[0]) setSucursal(String(sucursalesList[0].id))
        if (!area && areasList[0]) setArea(String(areasList[0].id))
        setInitialLoaded(true)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar catalogos")
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [token, sucursal, area])

  useEffect(() => {
    if (area && !areas.some((item) => String(item.id) === area && (!sucursal || item.sucursal === Number(sucursal)))) {
      setArea("")
    }
  }, [area, areas, sucursal])

  useEffect(() => {
    if (!token || !initialLoaded) return

    const run = async () => {
      try {
        setIsFetching(true)
        const data = await fetchAutorizarJustificaciones(token, {
          sucursal,
          area,
          mes,
          anio,
          filtroEstado,
        })
        setRows(data)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar justificaciones")
      } finally {
        setIsFetching(false)
      }
    }

    void run()
  }, [token, initialLoaded, sucursal, area, mes, anio, filtroEstado])

  useEffect(() => {
    setSelectedIds([])
  }, [sucursal, area, mes, anio, filtroEstado])

  const sucursalMap = useMemo(() => Object.fromEntries(sucursales.map((item) => [item.id, item.nombre])), [sucursales])
  const areaMap = useMemo(() => Object.fromEntries(areas.map((item) => [item.id, item.nombre])), [areas])

  const areasFiltradas = useMemo(() => {
    if (!sucursal) return areas
    return areas.filter((item) => item.sucursal === Number(sucursal))
  }, [areas, sucursal])

  const visibleRows = useMemo(() => {
    if (filtroEstado === "TODOS") return rows
    return rows.filter((item) => item.estado === filtroEstado)
  }, [rows, filtroEstado])

  const selectedRows = useMemo(
    () => visibleRows.filter((item) => selectedIds.includes(item.id)),
    [visibleRows, selectedIds]
  )

  const exportRows = useMemo(
    () => buildAutorizarExportRows(visibleRows, sucursalMap, areaMap),
    [visibleRows, sucursalMap, areaMap]
  )

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const reloadRows = async () => {
    if (!token) return
    const data = await fetchAutorizarJustificaciones(token, {
      sucursal,
      area,
      mes,
      anio,
      filtroEstado,
    })
    setRows(data)
  }

  const gestionar = async (accion: "AUTORIZAR" | "NO_AUTORIZAR", motivo = "") => {
    if (!token || selectedIds.length === 0) return

    try {
      await gestionarJustificaciones(token, { ids: selectedIds, accion, motivo })
      await reloadRows()
      setSelectedIds([])
      toast.success(accion === "AUTORIZAR" ? "Justificaciones autorizadas" : "Justificaciones no autorizadas")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar estado")
    }
  }

  const exportarExcel = () => {
    const headers = ["Sucursal", "Area", "Numero de Documento", "Nombres", "Motivo", "Fecha Inicio", "Fecha Fin", "Dias", "Nombre Documento", "Estado"]
    const lines = [
      headers.join(","),
      ...exportRows.map((item) =>
        [item.sucursal, item.area, item.numeroDocumento, item.nombres, item.motivo, item.fechaInicio, item.fechaFin, item.dias, item.nombreDocumento, item.estado]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ]
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `autorizacion-justificacion-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportarPdf = () => {
    const html = exportRows
      .map((item) => `<tr><td>${item.sucursal}</td><td>${item.area}</td><td>${item.numeroDocumento}</td><td>${item.nombres}</td><td>${item.motivo}</td><td>${item.fechaInicio}</td><td>${item.fechaFin}</td><td>${item.dias}</td><td>${item.nombreDocumento}</td><td>${item.estado}</td></tr>`)
      .join("")
    const win = window.open("", "_blank", "width=1200,height=800")
    if (!win) return
    win.document.write(`<html><head><title>Autorizacion de Justificacion</title><style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #d1d5db;padding:6px}th{background:#65a30d;color:#fff}</style></head><body><h1>Reporte de Autorizacion de Justificacion</h1><table><thead><tr><th>Sucursal</th><th>Area</th><th>Nro Documento</th><th>Nombres</th><th>Motivo</th><th>Inicio</th><th>Fin</th><th>Dias</th><th>Nombre Documento</th><th>Estado</th></tr></thead><tbody>${html}</tbody></table></body></html>`)
    win.document.close()
    win.print()
  }

  return {
    token,
    loading,
    isFetching,
    sucursales,
    areas,
    selectedIds,
    sucursal,
    setSucursal,
    area,
    setArea,
    mes,
    setMes,
    anio,
    setAnio,
    filtroEstado,
    setFiltroEstado,
    openAutorizarModal,
    setOpenAutorizarModal,
    openNoAutorizarModal,
    setOpenNoAutorizarModal,
    descripcionNoAutorizado,
    setDescripcionNoAutorizado,
    detailRow,
    setDetailRow,
    sucursalMap,
    areaMap,
    areasFiltradas,
    visibleRows,
    selectedRows,
    toggleSelected,
    gestionar,
    exportarExcel,
    exportarPdf,
  }
}
