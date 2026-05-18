"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Catalog, Personal } from "../interfaces/procesar-asistencia.interface"
import {
  descargarMarcacionesDispositivos,
  fetchAllDispositivosActivosIds,
  fetchPersonalesProcesarPage,
  fetchProcesarAsistenciaCatalogs,
  generarReporteGeneral,
} from "../services/procesar-asistencia.service"
import { buildCatalogMap, getPeriodFromRange, toInputDate, toSlashDate } from "../utils/procesar-asistencia.utils"

const SEARCH_DEBOUNCE_MS = 350
const REPORT_BATCH_SIZE = 4

export function useProcesarAsistenciaPage() {
  const token = useUserStore((s) => s.accessToken)
  const today = new Date()

  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [fechaInicio, setFechaInicio] = useState(toInputDate(new Date(today.getFullYear(), today.getMonth(), 1)))
  const [fechaFin, setFechaFin] = useState(toInputDate(new Date(today.getFullYear(), today.getMonth() + 1, 0)))
  const [rows, setRows] = useState<Personal[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [empresas, setEmpresas] = useState<Catalog[]>([])
  const [sucursales, setSucursales] = useState<Catalog[]>([])
  const [areas, setAreas] = useState<Catalog[]>([])
  const [dispositivoIds, setDispositivoIds] = useState<number[]>([])
  const [selected, setSelected] = useState<Record<number, boolean>>({})
  const rowsRequestIdRef = useRef(0)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [search])

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoading(false)
        setInitialLoading(false)
        return
      }
      try {
        const [catalogs, ids] = await Promise.all([
          fetchProcesarAsistenciaCatalogs(token),
          fetchAllDispositivosActivosIds(token),
        ])
        setEmpresas(catalogs[0])
        setSucursales(catalogs[1])
        setAreas(catalogs[2])
        setDispositivoIds(ids)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudieron cargar catalogos")
      } finally {
        setInitialLoading(false)
      }
    }
    void run()
  }, [token])

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      const requestId = rowsRequestIdRef.current + 1
      rowsRequestIdRef.current = requestId

      try {
        setLoading(true)
        setIsFetching(true)
        const response = await fetchPersonalesProcesarPage(token, {
          search: debouncedSearch,
        })
        setRows(response.results)
        setTotalItems(response.count)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar personal")
      } finally {
        if (rowsRequestIdRef.current === requestId) {
          setLoading(false)
          setIsFetching(false)
        }
      }
    }
    void run()
  }, [token, debouncedSearch])

  const empresaMap = useMemo(() => buildCatalogMap(empresas, "razon_social"), [empresas])
  const sucursalMap = useMemo(() => buildCatalogMap(sucursales, "nombre"), [sucursales])
  const areaMap = useMemo(() => buildCatalogMap(areas, "nombre"), [areas])

  const selectedIds = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, isSelected]) => isSelected)
        .map(([id]) => Number(id))
        .filter((id) => Number.isFinite(id)),
    [selected]
  )

  const currentPageSelectedCount = useMemo(() => rows.filter((item) => selected[item.id]).length, [rows, selected])

  const toggleAll = (checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev }
      rows.forEach((item) => {
        next[item.id] = checked
      })
      return next
    })
  }

  const processReportBatch = async (ids: number[], anio: string, mes: string) => {
    for (let index = 0; index < ids.length; index += REPORT_BATCH_SIZE) {
      const chunk = ids.slice(index, index + REPORT_BATCH_SIZE)
      await Promise.all(chunk.map((personalId) => generarReporteGeneral(token as string, personalId, anio, mes)))
    }
  }

  const handleProcesar = async () => {
    if (!token || selectedIds.length === 0) return
    const periodo = getPeriodFromRange(fechaInicio)

    try {
      setProcessing(true)
      if (dispositivoIds.length === 0) {
        toast.error("No hay dispositivos activos para descargar marcaciones.")
        return
      }

      const descarga = await descargarMarcacionesDispositivos(token, dispositivoIds)

      const totalCreadas = Number((descarga as { total_creadas?: number }).total_creadas || 0)
      const resultados = Array.isArray((descarga as { resultados?: unknown[] }).resultados)
        ? ((descarga as { resultados: unknown[] }).resultados)
        : []
      const totalSinPersonal = resultados.reduce<number>((acc, item) => {
        if (!item || typeof item !== "object") return acc
        return acc + Number((item as { sin_personal?: number }).sin_personal || 0)
      }, 0)

      await processReportBatch(selectedIds, periodo.anio, periodo.mes)

      toast.success(
        `Descarga biometrico OK. Nuevas: ${totalCreadas}, sin personal: ${totalSinPersonal}. Procesados: ${selectedIds.length} trabajador(es) entre ${toSlashDate(fechaInicio)} y ${toSlashDate(fechaFin)}.`
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo procesar asistencia")
    } finally {
      setProcessing(false)
    }
  }

  return {
    token,
    loading,
    initialLoading,
    isFetching,
    processing,
    search,
    setSearch,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    rows,
    selected,
    setSelected,
    selectedIds,
    currentPageSelectedCount,
    toggleAll,
    handleProcesar,
    empresaMap,
    sucursalMap,
    areaMap,
    totalItems,
  }
}
