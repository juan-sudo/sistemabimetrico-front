"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { openPayrollSlipPrint, type PayrollSlipPayload } from "@/lib/payroll-slip"
import useUserStore from "@/stores/useUserStore"
import type { Area, Boleta, Personal, PersonalBoleta, TipoTrabajador } from "../interfaces/boleta-mensual"
import { fetchBaseData, fetchBoletas, fetchResumenPlanilla, generarBoletas } from "../services/boleta-mensual.service"
import { buildPrintHtml, getCsvLines, getPeriodo, PEN } from "../utils/boleta-mensual"

export default function useBoletaMensualModule() {
  const token = useUserStore((s) => s.accessToken)
  const now = new Date()

  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [personales, setPersonales] = useState<Personal[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [tiposTrabajador, setTiposTrabajador] = useState<TipoTrabajador[]>([])
  const [boletas, setBoletas] = useState<Boleta[]>([])

  const loadBase = async () => {
    if (!token) return
    const data = await fetchBaseData(token)
    setPersonales(data.personales)
    setAreas(data.areas)
    setTiposTrabajador(data.tiposTrabajador)
  }

  const loadBoletasByPeriodo = async () => {
    if (!token) return
    const data = await fetchBoletas(token, year, month)
    setBoletas(data)
  }

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        await loadBase()
        await loadBoletasByPeriodo()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar informacion")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [token])

  useEffect(() => {
    if (!token) return
    loadBoletasByPeriodo().catch(() => {})
  }, [month, year, token])

  const areaMap = useMemo(() => Object.fromEntries(areas.map((x) => [x.id, x.nombre])), [areas])
  const tipoMap = useMemo(() => Object.fromEntries(tiposTrabajador.map((x) => [x.id, x.descripcion])), [tiposTrabajador])
  const boletaByPersonal = useMemo(() => Object.fromEntries(boletas.map((x) => [x.personal, x])), [boletas])

  const rows = useMemo<PersonalBoleta[]>(() => {
    return personales.map((p) => {
      const b = boletaByPersonal[p.id]
      const sueldo = b ? Number(b.sueldo_base || 0) : 0
      return {
        id: p.id,
        documento: p.numero_documento,
        nombres: p.nombres_completos,
        area: areaMap[p.area] || "-",
        tipoTrabajador: tipoMap[p.tipo_trabajador] || "-",
        sueldoBase: Number.isFinite(sueldo) ? sueldo : 0,
      }
    })
  }, [personales, boletaByPersonal, areaMap, tipoMap])

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return rows
    return rows.filter((x) => `${x.nombres} ${x.documento} ${x.area}`.toLowerCase().includes(term))
  }, [rows, search])

  const selectedIds = useMemo(() => filteredRows.filter((item) => selected[item.id]).map((item) => item.id), [filteredRows, selected])

  const periodo = useMemo(() => getPeriodo(month, year), [month, year])

  const toggleAllVisible = (checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev }
      filteredRows.forEach((item) => {
        next[item.id] = checked
      })
      return next
    })
  }

  const getSelectedRows = () => rows.filter((x) => selectedIds.includes(x.id))

  const handleGenerarBoletas = async () => {
    if (!token || selectedIds.length === 0) return
    try {
      setGenerating(true)
      const res = await generarBoletas(token, year, month, selectedIds)
      await loadBoletasByPeriodo()
      const created = Number(res.creados || 0)
      const existing = Number(res.existentes || 0)
      toast.success(`Periodo ${periodo}: ${created} boleta(s) creada(s), ${existing} existente(s).`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo generar boletas")
    } finally {
      setGenerating(false)
    }
  }

  const handleDescargarExcel = () => {
    if (selectedIds.length === 0) return
    const selectedRows = getSelectedRows()
    const lines = getCsvLines(selectedRows, periodo)
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `boletas_${year}_${month}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDescargarPdf = async () => {
    if (selectedIds.length === 0) return
    if (selectedIds.length === 1 && token) {
      try {
        const resumen = await fetchResumenPlanilla(token, selectedIds[0], year, month)
        openPayrollSlipPrint(resumen as PayrollSlipPayload)
        return
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo generar la boleta individual")
        return
      }
    }

    const selectedRows = getSelectedRows()
    const win = window.open("", "_blank", "width=1000,height=700")
    if (!win) return
    win.document.write(buildPrintHtml(selectedRows, periodo))
    win.document.close()
  }

  return {
    token,
    month,
    year,
    search,
    selected,
    loading,
    generating,
    filteredRows,
    selectedIds,
    periodo,
    PEN,
    setMonth,
    setYear,
    setSearch,
    setSelected,
    toggleAllVisible,
    handleGenerarBoletas,
    handleDescargarExcel,
    handleDescargarPdf,
  }
}
