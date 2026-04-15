"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { writeAttendanceNotifications } from "@/lib/attendance-notifications"
import useUserStore from "@/stores/useUserStore"
import type { DescargaTab, Dispositivo } from "../interfaces/descargar-marcas.interface"
import {
  descargarDispositivo,
  fetchDispositivos,
  verCapacidadDispositivo,
  verRawDispositivo,
} from "../services/descargar-marcas.service"
import { asArray, downloadJson } from "../utils/descargar-marcas.utils"

export function useDescargarMarcasPage() {
  const token = useUserStore((s) => s.accessToken)

  const [tab, setTab] = useState<DescargaTab>("dispositivo")
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [readingRaw, setReadingRaw] = useState(false)
  const [readingCapacity, setReadingCapacity] = useState(false)
  const [devices, setDevices] = useState<Dispositivo[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [rawPreview, setRawPreview] = useState<Array<Record<string, unknown>>>([])
  const [capacityPreview, setCapacityPreview] = useState<Array<Record<string, unknown>>>([])
  const [fechaInicioRaw, setFechaInicioRaw] = useState("")
  const [fechaFinRaw, setFechaFinRaw] = useState("")

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await fetchDispositivos(token)
        const rows = (asArray(data) as Dispositivo[]).filter((item) => item.activo)
        setDevices(rows)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar dispositivos")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [token])

  const allSelected = useMemo(() => devices.length > 0 && selectedIds.length === devices.length, [devices, selectedIds])

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const descargarMarcaciones = async () => {
    if (!token || selectedIds.length === 0) return
    try {
      setDownloading(true)
      const response = await descargarDispositivo(token, selectedIds)

      writeAttendanceNotifications((response as { notificaciones?: unknown }).notificaciones)
      const totalCreadas = Number((response as { total_creadas?: number }).total_creadas || 0)
      const totalDuplicadas = Number((response as { total_duplicadas?: number }).total_duplicadas || 0)
      const reportesActualizados = Number((response as { reportes_actualizados?: number }).reportes_actualizados || 0)
      const rawLogs = asArray((response as { raw_logs?: unknown[] }).raw_logs)
      const resultados = asArray((response as { resultados?: unknown[] }).resultados)
      const errores = resultados.filter(
        (item) => item && typeof item === "object" && (item as { estado?: string }).estado === "error"
      )
      const totalSinPersonal = resultados.reduce<number>((acc, item) => {
        if (!item || typeof item !== "object") return acc
        return acc + Number((item as { sin_personal?: number }).sin_personal || 0)
      }, 0)

      if (errores.length > 0) {
        const primerError = errores[0] as { detalle?: string }
        toast.error(primerError.detalle || "Una o mas descargas fallaron")
      } else {
        try {
          localStorage.setItem(
            "marcaciones_raw_ultima_descarga",
            JSON.stringify({
              generated_at: new Date().toISOString(),
              total: rawLogs.length,
              data: rawLogs,
            })
          )
        } catch (_) {
          // Ignorar errores de almacenamiento local del navegador.
        }

        toast.success(
          `Descarga completada. Nuevas: ${totalCreadas}. Duplicadas: ${totalDuplicadas}. Sin personal: ${totalSinPersonal}. Reportes actualizados: ${reportesActualizados}.`
        )
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo descargar marcaciones")
    } finally {
      setDownloading(false)
    }
  }

  const onVerRawDispositivo = async () => {
    if (!token || selectedIds.length === 0) return
    try {
      setReadingRaw(true)
      const response = await verRawDispositivo(token, selectedIds, fechaInicioRaw, fechaFinRaw)
      const rawLogs = asArray((response as { raw_logs?: unknown[] }).raw_logs) as Array<Record<string, unknown>>
      setRawPreview(rawLogs)
      toast.success(`Lectura RAW completada. Registros leidos: ${rawLogs.length}. No se guardo en base de datos.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo leer RAW del dispositivo")
    } finally {
      setReadingRaw(false)
    }
  }

  const onVerCapacidadDispositivo = async () => {
    if (!token || selectedIds.length === 0) return
    try {
      setReadingCapacity(true)
      const response = await verCapacidadDispositivo(token, selectedIds)
      const resultados = asArray((response as { resultados?: unknown[] }).resultados) as Array<Record<string, unknown>>
      setCapacityPreview(resultados)
      const ok = resultados.filter((item) => item && item.estado === "ok").length
      toast.success(`Capacidad consultada. Equipos exitosos: ${ok}/${resultados.length}.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo leer capacidad del dispositivo")
    } finally {
      setReadingCapacity(false)
    }
  }

  const descargarRawPreviewJson = () => {
    if (rawPreview.length === 0) return

    const payload = {
      metadata: {
        generado_en: new Date().toISOString(),
        total_registros: rawPreview.length,
        origen: "lectura_raw_dispositivo_solo_lectura",
        fecha_inicio: fechaInicioRaw || null,
        fecha_fin: fechaFinRaw || null,
      },
      registros: rawPreview,
    }

    downloadJson(payload, `raw-dispositivo-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`)
  }

  return {
    token,
    tab,
    setTab,
    loading,
    downloading,
    readingRaw,
    readingCapacity,
    devices,
    selectedIds,
    setSelectedIds,
    rawPreview,
    capacityPreview,
    fechaInicioRaw,
    setFechaInicioRaw,
    fechaFinRaw,
    setFechaFinRaw,
    allSelected,
    toggleSelect,
    descargarMarcaciones,
    onVerRawDispositivo,
    onVerCapacidadDispositivo,
    descargarRawPreviewJson,
  }
}
