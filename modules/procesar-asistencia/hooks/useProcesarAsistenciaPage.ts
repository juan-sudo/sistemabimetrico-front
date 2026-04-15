"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Catalog, Dispositivo, Personal } from "../interfaces/procesar-asistencia.interface"
import { descargarMarcacionesDispositivos, fetchProcesarAsistenciaData, generarReporteGeneral } from "../services/procesar-asistencia.service"
import { asArray, buildCatalogMap, filterPersonales, getPeriodFromRange, toInputDate, toSlashDate } from "../utils/procesar-asistencia.utils"

export function useProcesarAsistenciaPage() {
  const token = useUserStore((s) => s.accessToken)
  const today = new Date()

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [search, setSearch] = useState("")
  const [fechaInicio, setFechaInicio] = useState(toInputDate(new Date(today.getFullYear(), today.getMonth(), 1)))
  const [fechaFin, setFechaFin] = useState(toInputDate(new Date(today.getFullYear(), today.getMonth() + 1, 0)))
  const [personales, setPersonales] = useState<Personal[]>([])
  const [empresas, setEmpresas] = useState<Catalog[]>([])
  const [sucursales, setSucursales] = useState<Catalog[]>([])
  const [areas, setAreas] = useState<Catalog[]>([])
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
  const [selected, setSelected] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const [p, e, s, a, d] = await fetchProcesarAsistenciaData(token)
        setPersonales(asArray(p) as Personal[])
        setEmpresas(asArray(e) as Catalog[])
        setSucursales(asArray(s) as Catalog[])
        setAreas(asArray(a) as Catalog[])
        setDispositivos((asArray(d) as Dispositivo[]).filter((item) => item.activo))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar personal")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [token])

  const empresaMap = useMemo(() => buildCatalogMap(empresas, "razon_social"), [empresas])
  const sucursalMap = useMemo(() => buildCatalogMap(sucursales, "nombre"), [sucursales])
  const areaMap = useMemo(() => buildCatalogMap(areas, "nombre"), [areas])

  const filteredRows = useMemo(
    () =>
      filterPersonales({
        personales,
        search,
        empresaMap,
        sucursalMap,
        areaMap,
      }),
    [personales, search, empresaMap, sucursalMap, areaMap]
  )

  const selectedIds = useMemo(
    () => filteredRows.filter((item) => selected[item.id]).map((item) => item.id),
    [filteredRows, selected]
  )

  const toggleAll = (checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev }
      filteredRows.forEach((item) => {
        next[item.id] = checked
      })
      return next
    })
  }

  const handleProcesar = async () => {
    if (!token || selectedIds.length === 0) return
    const periodo = getPeriodFromRange(fechaInicio)

    try {
      setProcessing(true)
      if (dispositivos.length === 0) {
        toast.error("No hay dispositivos activos para descargar marcaciones.")
        return
      }

      const descarga = await descargarMarcacionesDispositivos(
        token,
        dispositivos.map((item) => item.id)
      )

      const totalCreadas = Number((descarga as { total_creadas?: number }).total_creadas || 0)
      const resultados = asArray((descarga as { resultados?: unknown[] }).resultados)
      const totalSinPersonal = resultados.reduce<number>((acc, item) => {
        if (!item || typeof item !== "object") return acc
        return acc + Number((item as { sin_personal?: number }).sin_personal || 0)
      }, 0)

      let ok = 0
      for (const personalId of selectedIds) {
        await generarReporteGeneral(token, personalId, periodo.anio, periodo.mes)
        ok += 1
      }

      toast.success(
        `Descarga biometrico OK. Nuevas: ${totalCreadas}, sin personal: ${totalSinPersonal}. Procesados: ${ok} trabajador(es) entre ${toSlashDate(fechaInicio)} y ${toSlashDate(fechaFin)}.`
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
    processing,
    search,
    setSearch,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    filteredRows,
    selected,
    setSelected,
    selectedIds,
    toggleAll,
    handleProcesar,
    empresaMap,
    sucursalMap,
    areaMap,
  }
}
