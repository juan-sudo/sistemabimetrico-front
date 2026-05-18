"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { DescargaTab, Dispositivo } from "../interfaces/descargar-marcas.interface"
import {
  descargarDispositivo,
  fetchDispositivos,
  verCapacidadDispositivo,
  verRawDispositivo,
} from "../services/descargar-marcas.service"
import { asArray, downloadJson } from "../utils/descargar-marcas.utils"

const SEARCH_DEBOUNCE_MS = 300
const DOWNLOAD_CONCURRENCY = 4

type DeviceDownloadResult = {
  deviceName: string
  status: "ok" | "error"
  creadas: number
  duplicadas: number
  sinPersonal: number
  detalle?: string
}

export function useDescargarMarcasPage() {
  const token = useUserStore((s) => s.accessToken)

  const [tab, setTab] = useState<DescargaTab>("dispositivo")
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [readingRaw, setReadingRaw] = useState(false)
  const [readingCapacity, setReadingCapacity] = useState(false)
  const [devices, setDevices] = useState<Dispositivo[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [rawPreview, setRawPreview] = useState<Array<Record<string, unknown>>>([])
  const [capacityPreview, setCapacityPreview] = useState<Array<Record<string, unknown>>>([])
  const [fechaInicioRaw, setFechaInicioRaw] = useState("")
  const [fechaFinRaw, setFechaFinRaw] = useState("")
  const [claveComunicacion, setClaveComunicacion] = useState("0")

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timeoutId)
  }, [search])

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await fetchDispositivos(token, { activo: true, pageSize: 500 })
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

  const filteredDevices = useMemo(() => {
    if (!debouncedSearch) return devices
    return devices.filter((item) => {
      const usage = item.uso === "ASISTENCIA" ? "control de asistencia" : "control de acceso"
      const target = `${item.nombre} ${item.direccion} ${item.puerto} ${item.uso} ${usage}`.toLowerCase()
      return target.includes(debouncedSearch)
    })
  }, [debouncedSearch, devices])

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const allSelected = useMemo(
    () => filteredDevices.length > 0 && filteredDevices.every((item) => selectedIdSet.has(item.id)),
    [filteredDevices, selectedIdSet]
  )

  const rawPreviewText = useMemo(() => JSON.stringify(rawPreview.slice(0, 100), null, 2), [rawPreview])

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }, [])

  const toggleSelectAllFiltered = useCallback((checked: boolean) => {
    setSelectedIds((prev) => {
      const filteredIds = filteredDevices.map((item) => item.id)
      const filteredSet = new Set(filteredIds)
      if (checked) {
        const next = new Set([...prev, ...filteredIds])
        return [...next]
      }
      return prev.filter((id) => !filteredSet.has(id))
    })
  }, [filteredDevices])

  const processDeviceDownload = useCallback(async (deviceId: number): Promise<DeviceDownloadResult> => {
    const device = devices.find((d) => d.id === deviceId)
    const fallbackName = `ID ${deviceId}`
    if (!device) {
      return {
        deviceName: fallbackName,
        status: "error",
        creadas: 0,
        duplicadas: 0,
        sinPersonal: 0,
        detalle: "Dispositivo no encontrado en memoria.",
      }
    }

    try {
      const commKey = Number(claveComunicacion || "0") || 0
      const response = await descargarDispositivo(token as string, [deviceId], commKey)
      const resultados = asArray((response as { resultados?: unknown[] }).resultados)
      const resultadoDispositivo = resultados[0] as Record<string, unknown> | undefined

      if (resultadoDispositivo?.estado === "error") {
        return {
          deviceName: device.nombre,
          status: "error",
          creadas: 0,
          duplicadas: 0,
          sinPersonal: 0,
          detalle: String(resultadoDispositivo.detalle ?? "Error desconocido"),
        }
      }

      return {
        deviceName: device.nombre,
        status: "ok",
        creadas: Number(resultadoDispositivo?.creadas ?? 0),
        duplicadas: Number(resultadoDispositivo?.duplicadas ?? 0),
        sinPersonal: Number(resultadoDispositivo?.sin_personal ?? 0),
      }
    } catch (err) {
      return {
        deviceName: device.nombre,
        status: "error",
        creadas: 0,
        duplicadas: 0,
        sinPersonal: 0,
        detalle: err instanceof Error ? err.message : "Error desconocido",
      }
    }
  }, [devices, token, claveComunicacion])

  const descargarMarcaciones = async () => {
    if (!token || selectedIds.length === 0) return

    setDownloading(true)
    toast.info(`Iniciando descarga para ${selectedIds.length} dispositivo(s)...`)

    const queue = [...selectedIds]
    const results: DeviceDownloadResult[] = []
    const workers = Array.from({ length: Math.min(DOWNLOAD_CONCURRENCY, queue.length) }, () => {
      return async () => {
        while (queue.length > 0) {
          const deviceId = queue.shift()
          if (typeof deviceId !== "number") continue
          const result = await processDeviceDownload(deviceId)
          results.push(result)
        }
      }
    })

    try {
      await Promise.all(workers.map((worker) => worker()))

      const okResults = results.filter((item) => item.status === "ok")
      const errorResults = results.filter((item) => item.status === "error")
      const totalCreadas = okResults.reduce((acc, item) => acc + item.creadas, 0)
      const totalDuplicadas = okResults.reduce((acc, item) => acc + item.duplicadas, 0)
      const totalSinPersonal = okResults.reduce((acc, item) => acc + item.sinPersonal, 0)

      toast.success(
        `Descarga finalizada. Exitosos: ${okResults.length}/${results.length}. Nuevas: ${totalCreadas}, duplicadas: ${totalDuplicadas}, sin personal: ${totalSinPersonal}.`
      )

      if (errorResults.length > 0) {
        const sample = errorResults.slice(0, 3).map((item) => `${item.deviceName}: ${item.detalle ?? "Error"}`).join(" | ")
        toast.error(`Fallaron ${errorResults.length} dispositivo(s). ${sample}`)
      }
    } finally {
      setDownloading(false)
    }
  }

  const onVerRawDispositivo = async () => {
    if (!token || selectedIds.length === 0) return
    try {
      setReadingRaw(true)
      const commKey = Number(claveComunicacion || "0") || 0
      const response = await verRawDispositivo(token, selectedIds, fechaInicioRaw, fechaFinRaw, commKey)
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
      const commKey = Number(claveComunicacion || "0") || 0
      const response = await verCapacidadDispositivo(token, selectedIds, commKey)
      const resultados = asArray((response as { resultados?: unknown[] }).resultados) as Array<Record<string, unknown>>
      setCapacityPreview(resultados)
      const ok = resultados.filter((item) => item && item.estado === "ok").length
      toast.success(`Capacidad consultada. Equipos exitosos: ${ok}/${resultados.length}.`)

      const errores = resultados.filter((item) => item && item.estado === "error") as Array<Record<string, unknown>>
      if (errores.length > 0) {
        const sample = errores
          .slice(0, 3)
          .map((item) => `${String(item.dispositivo ?? "Equipo")}: ${String(item.detalle ?? "Error")}`)
          .join(" | ")
        toast.error(`Fallaron ${errores.length} equipo(s). ${sample}`)
      }
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
    filteredDevices,
    selectedIds,
    selectedIdSet,
    setSelectedIds,
    search,
    setSearch,
    rawPreview,
    rawPreviewText,
    capacityPreview,
    fechaInicioRaw,
    setFechaInicioRaw,
    fechaFinRaw,
    setFechaFinRaw,
    claveComunicacion,
    setClaveComunicacion,
    allSelected,
    toggleSelect,
    toggleSelectAllFiltered,
    descargarMarcaciones,
    onVerRawDispositivo,
    onVerCapacidadDispositivo,
    descargarRawPreviewJson,
  }
}
