"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import { openPersonalReportPrint, type ReporteGeneralPayload } from "@/lib/report-personal"
import type { Personal, ResumenPayload } from "../interfaces/resumen-planilla.interface"
import { fetchReporteGeneralByPersonal, fetchResumenPlanillaByPersonal, fetchResumenPlanillaPersonales } from "../services/resumen-planilla.service"
import { asArray, buildResumenCsvLines, downloadCsv } from "../utils/resumen-planilla.utils"

export function useResumenPlanillaPage() {
  const token = useUserStore((s) => s.accessToken)
  const today = new Date()

  const [loading, setLoading] = useState(true)
  const [loadingResumen, setLoadingResumen] = useState(false)
  const [personales, setPersonales] = useState<Personal[]>([])
  const [search, setSearch] = useState("")
  const [openTrabajadorModal, setOpenTrabajadorModal] = useState(false)
  const [modalSearch, setModalSearch] = useState("")
  const [personalId, setPersonalId] = useState("")
  const [mes, setMes] = useState(String(today.getMonth() + 1))
  const [anio, setAnio] = useState(String(today.getFullYear()))
  const [resumen, setResumen] = useState<ResumenPayload | null>(null)

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await fetchResumenPlanillaPersonales(token)
        setPersonales(asArray(data) as Personal[])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar personal")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [token])

  const filteredPersonales = useMemo(() => {
    const term = modalSearch.trim().toLowerCase()
    if (!term) return personales
    return personales.filter((item) => `${item.numero_documento} ${item.nombres_completos}`.toLowerCase().includes(term))
  }, [personales, modalSearch])

  const selectedPersonal = useMemo(
    () => personales.find((item) => String(item.id) === personalId) || null,
    [personales, personalId]
  )

  useEffect(() => {
    const run = async () => {
      if (!token || !personalId) {
        setResumen(null)
        return
      }
      try {
        setLoadingResumen(true)
        const data = await fetchResumenPlanillaByPersonal(token, personalId, anio, mes)
        setResumen(data as ResumenPayload)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar el resumen")
      } finally {
        setLoadingResumen(false)
      }
    }
    void run()
  }, [token, personalId, anio, mes])

  const handleSelectPersonal = (id: number, value: string) => {
    setPersonalId(String(id))
    setSearch(value)
    setOpenTrabajadorModal(false)
  }

  const handleDescargarExcel = () => {
    if (!resumen) return

    const lines = buildResumenCsvLines({
      trabajador: resumen.personal.nombres_completos,
      dni: resumen.personal.numero_documento,
      codigo: resumen.personal.codigo_empleado || "-",
      anio: resumen.periodo.anio,
      mes: resumen.periodo.mes,
      diasConMarcacion: resumen.resumen.dias_con_marcacion,
      diasJustificados: resumen.resumen.dias_justificados,
      diasDescansoMedico: resumen.resumen.dias_descanso_medico,
      diasFalta: resumen.resumen.dias_falta,
      sueldoBase: resumen.boleta.sueldo_base,
      netoPagar: resumen.boleta.neto_pagar,
    })

    const filename = `resumen-${resumen.personal.numero_documento}-${resumen.periodo.anio}-${resumen.periodo.mes}.csv`
    downloadCsv(filename, lines)
  }

  const handleDescargarPdf = async () => {
    if (!resumen || !token || !personalId) return

    try {
      const data = await fetchReporteGeneralByPersonal(token, personalId, anio, mes)
      openPersonalReportPrint(data as ReporteGeneralPayload)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo generar el reporte PDF")
    }
  }

  return {
    token,
    today,
    loading,
    loadingResumen,
    search,
    setSearch,
    openTrabajadorModal,
    setOpenTrabajadorModal,
    modalSearch,
    setModalSearch,
    personalId,
    mes,
    setMes,
    anio,
    setAnio,
    resumen,
    filteredPersonales,
    selectedPersonal,
    handleSelectPersonal,
    handleDescargarExcel,
    handleDescargarPdf,
  }
}
