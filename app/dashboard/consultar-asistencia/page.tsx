"use client"

import { useEffect, useMemo, useState } from "react"
import { Download, FileSearch, Search } from "lucide-react"
import { toast } from "sonner"
import { apiEndpoints, authRequest } from "@/lib/api-client"
import useUserStore from "@/stores/useUserStore"

type Personal = {
  id: number
  codigo_empleado: string
  numero_documento: string
  nombres_completos: string
  area: number
}

type Area = {
  id: number
  nombre: string
}

type Marcacion = {
  id: number
  personal: number
  dispositivo: number | null
  descarga: number | null
  fecha_hora: string
  codigo_equipo: string
  tipo_evento: "ENTRADA" | "SALIDA"
  situacion: string
}

type PersonalTurno = {
  id: number
  personal: number
  turno: number
  fecha_inicio: string
  fecha_fin: string | null
}

type Turno = {
  id: number
  nombre: string
}

type TurnoBloque = {
  id: number
  turno: number
  orden: number
  hora_entrada: string
  hora_salida: string
}

type FullRow = {
  id: number
  codigoEmpleado: string
  numeroDocumento: string
  area: string
  nombresCompletos: string
  turno: string
  horario: string
  dia: string
  fecha: string
  hEnt: string
  hSal: string
  mEnt: string
  mSal: string
  tRefrigerio: string
  salRefrigerio: string
  entRef: string
  refTomado: string
  tardRef: string
  tardanza: string
  eTemprano: string
  conGoce: string
  sinGoce: string
  sTemprano: string
  hDiurnas: string
  hNocturnas: string
  hExtras: string
  hExtrasRedondeo: string
  hECompensar: string
  hEPagar: string
  p25: string
  p35: string
  hed: string
  p25Hed: string
  p35Hed: string
  hen: string
  p25Hen: string
  p35Hen: string
  p100: string
  tLaborables: string
  tTrabajado: string
  hCompensado: string
  falta: string
  just: string
  feriado: string
}

const asArray = (x: unknown) =>
  Array.isArray(x) ? x : x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results) ? (x as { results: unknown[] }).results : []

const dayNames = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]

function formatInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatShortDate(value: string) {
  const [year, month, day] = value.split("-")
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

function getDateIso(value: string) {
  return value.slice(0, 10)
}

function getHour(value: string) {
  const parts = value.split("T")
  if (parts.length < 2) return "-"
  return parts[1].slice(0, 5)
}

function parseMinutes(value: string) {
  const [h, m] = value.split(":").map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  return h * 60 + m
}

function diffToHours(start: string, end: string) {
  const s = parseMinutes(start)
  const e = parseMinutes(end)
  if (s === null || e === null) return "0.00"
  let d = e - s
  if (d < 0) d += 24 * 60
  return (d / 60).toFixed(2)
}

function getDayName(isoDate: string) {
  const day = new Date(`${isoDate}T00:00:00`).getDay()
  return dayNames[day] || "-"
}

function timeRangeLabel(start: string, end: string) {
  if (!start || !end) return "-"
  return `${start.slice(0, 5)}-${end.slice(0, 5)}`
}

export default function ConsultarAsistenciaPage() {
  const token = useUserStore((s) => s.accessToken)
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [loading, setLoading] = useState(false)
  const [fechaInicio, setFechaInicio] = useState(formatInputDate(firstDayOfMonth))
  const [fechaFin, setFechaFin] = useState(formatInputDate(today))
  const [selectedPersonalId, setSelectedPersonalId] = useState<number | null>(null)
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false)
  const [personalSearch, setPersonalSearch] = useState("")

  const [personales, setPersonales] = useState<Personal[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [marcaciones, setMarcaciones] = useState<Marcacion[]>([])
  const [asignaciones, setAsignaciones] = useState<PersonalTurno[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [bloques, setBloques] = useState<TurnoBloque[]>([])

  useEffect(() => {
    const loadBaseData = async () => {
      if (!token) return
      try {
        const [p, a, pt, t, b] = await Promise.all([
          authRequest(apiEndpoints.personales, { token }),
          authRequest(apiEndpoints.areas, { token }),
          authRequest(apiEndpoints.personalTurnos, { token }),
          authRequest(apiEndpoints.turnos, { token }),
          authRequest(apiEndpoints.turnoBloquesHorario, { token }),
        ])
        setPersonales(asArray(p) as Personal[])
        setAreas(asArray(a) as Area[])
        setAsignaciones(asArray(pt) as PersonalTurno[])
        setTurnos(asArray(t) as Turno[])
        setBloques(asArray(b) as TurnoBloque[])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar datos base")
      }
    }
    loadBaseData()
  }, [token])

  useEffect(() => {
    const loadMarcaciones = async () => {
      if (!token) return
      if (!fechaInicio || !fechaFin || fechaInicio > fechaFin) {
        setMarcaciones([])
        return
      }
      const params = new URLSearchParams()
      params.set("fecha_inicio", fechaInicio)
      params.set("fecha_fin", fechaFin)
      if (selectedPersonalId) params.set("personal", String(selectedPersonalId))

      setLoading(true)
      try {
        const response = await authRequest(`${apiEndpoints.marcaciones}?${params.toString()}`, { token })
        setMarcaciones(asArray(response) as Marcacion[])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar marcaciones")
      } finally {
        setLoading(false)
      }
    }
    loadMarcaciones()
  }, [token, fechaInicio, fechaFin, selectedPersonalId])

  const personalMap = useMemo(() => Object.fromEntries(personales.map((item) => [item.id, item])), [personales])
  const areaMap = useMemo(() => Object.fromEntries(areas.map((item) => [item.id, item.nombre])), [areas])
  const turnoMap = useMemo(() => Object.fromEntries(turnos.map((item) => [item.id, item.nombre])), [turnos])
  const bloquesByTurno = useMemo(() => {
    const out: Record<number, TurnoBloque[]> = {}
    for (const block of bloques) {
      if (!out[block.turno]) out[block.turno] = []
      out[block.turno].push(block)
    }
    Object.values(out).forEach((items) => items.sort((a, b) => a.orden - b.orden))
    return out
  }, [bloques])

  const rows = useMemo<FullRow[]>(() => {
    const grouped: Record<string, Marcacion[]> = {}
    for (const mark of marcaciones) {
      const fechaIso = getDateIso(mark.fecha_hora)
      const key = `${mark.personal}::${fechaIso}`
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(mark)
    }

    const resolved: FullRow[] = []

    for (const [key, marks] of Object.entries(grouped)) {
      const [personalRaw, fechaIso] = key.split("::")
      const personalId = Number(personalRaw)
      const person = personalMap[personalId]
      const ordered = [...marks].sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora))

      const activeAssignment =
        asignaciones.find((assignment) => assignment.personal === personalId && assignment.fecha_inicio <= fechaIso && (!assignment.fecha_fin || assignment.fecha_fin >= fechaIso)) ||
        null
      const turnoNombre = activeAssignment ? turnoMap[activeAssignment.turno] || "-" : "-"
      const turnoBloques = activeAssignment ? bloquesByTurno[activeAssignment.turno] || [] : []

      let hEnt = "-"
      let hSal = "-"
      if (turnoBloques.length > 0) {
        const entradas = turnoBloques.map((item) => item.hora_entrada.slice(0, 5))
        const salidas = turnoBloques.map((item) => item.hora_salida.slice(0, 5))
        hEnt = entradas.sort()[0] || "-"
        hSal = salidas.sort().slice(-1)[0] || "-"
        const entM = hEnt !== "-" ? parseMinutes(hEnt) : null
        const salM = hSal !== "-" ? parseMinutes(hSal) : null
        if (entM !== null && salM !== null && salM <= entM) {
          // Evita mostrar salidas invalidas tipo 01:00 para turnos diurnos.
          hSal = "-"
        }
      }

      const firstEntry = ordered.find((item) => item.tipo_evento === "ENTRADA")
      const lastExit = [...ordered].reverse().find((item) => item.tipo_evento === "SALIDA")
      const mEnt = firstEntry ? getHour(firstEntry.fecha_hora) : "-"
      const mSal = lastExit ? getHour(lastExit.fecha_hora) : "-"
      const tLaborables = hEnt !== "-" && hSal !== "-" ? diffToHours(hEnt, hSal) : "0.00"
      const tTrabajado = mEnt !== "-" && mSal !== "-" ? diffToHours(mEnt, mSal) : "0.00"

      resolved.push({
        id: ordered[0]?.id || 0,
        codigoEmpleado: person?.codigo_empleado || "-",
        numeroDocumento: person?.numero_documento || "-",
        area: areaMap[person?.area || 0] || "-",
        nombresCompletos: person?.nombres_completos || "-",
        turno: turnoNombre,
        horario: hEnt !== "-" && hSal !== "-" ? timeRangeLabel(hEnt, hSal) : "-",
        dia: getDayName(fechaIso),
        fecha: formatShortDate(fechaIso),
        hEnt,
        hSal,
        mEnt,
        mSal,
        tRefrigerio: "0",
        salRefrigerio: "-",
        entRef: "-",
        refTomado: "0",
        tardRef: "0",
        tardanza: "0",
        eTemprano: "0",
        conGoce: "0",
        sinGoce: "0",
        sTemprano: "0",
        hDiurnas: tTrabajado,
        hNocturnas: "0.00",
        hExtras: "0.00",
        hExtrasRedondeo: "0.00",
        hECompensar: "0.00",
        hEPagar: "0.00",
        p25: "0.00",
        p35: "0.00",
        hed: "0.00",
        p25Hed: "0.00",
        p35Hed: "0.00",
        hen: "0.00",
        p25Hen: "0.00",
        p35Hen: "0.00",
        p100: "0.00",
        tLaborables,
        tTrabajado,
        hCompensado: "0.00",
        falta: "0",
        just: "0",
        feriado: "0",
      })
    }

    return resolved.sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha)
      return a.nombresCompletos.localeCompare(b.nombresCompletos)
    })
  }, [marcaciones, personalMap, areaMap, asignaciones, turnoMap, bloquesByTurno])

  const selectedPersonal = useMemo(
    () => (selectedPersonalId ? personales.find((item) => item.id === selectedPersonalId) || null : null),
    [personales, selectedPersonalId]
  )

  const selectedLabel = selectedPersonal
    ? `${selectedPersonal.numero_documento} - ${selectedPersonal.nombres_completos}`
    : "Todos los trabajadores"

  const modalPersonales = useMemo(() => {
    const term = personalSearch.trim().toLowerCase()
    if (!term) return personales
    return personales.filter((item) => `${item.numero_documento} ${item.nombres_completos}`.toLowerCase().includes(term))
  }, [personales, personalSearch])

  const exportHeaders = [
    "Codigo de Empleado",
    "Numero de Documento",
    "Area",
    "Nombres Completos",
    "Turno",
    "Horario",
    "Dia",
    "Fecha",
    "H.Ent.",
    "H.Sal.",
    "M.Ent.",
    "M.Sal.",
    "T.Refrigerio",
    "Sal.Refrigerio",
    "Ent.Ref.",
    "Ref.Tomado",
    "Tard. Ref.",
    "Tardanza",
    "E.Temprano",
    "Con Goce",
    "Sin Goce",
    "S. Temprano",
    "H.Diurnas",
    "H.Nocturnas",
    "H.Extras",
    "H.Extras Redondeo",
    "H.E.Compensar",
    "H.E.Pagar",
    "25%",
    "35%",
    "HED",
    "25%HED",
    "35%HED",
    "HEN",
    "25%HEN",
    "35%HEN",
    "100%",
    "T.Laborables",
    "T.Trabajado",
    "H.Compensado",
    "Falta",
    "Just.",
    "Feriado",
  ]

  const exportRows = rows.map((item) => [
    item.codigoEmpleado,
    item.numeroDocumento,
    item.area,
    item.nombresCompletos,
    item.turno,
    item.horario,
    item.dia,
    item.fecha,
    item.hEnt,
    item.hSal,
    item.mEnt,
    item.mSal,
    item.tRefrigerio,
    item.salRefrigerio,
    item.entRef,
    item.refTomado,
    item.tardRef,
    item.tardanza,
    item.eTemprano,
    item.conGoce,
    item.sinGoce,
    item.sTemprano,
    item.hDiurnas,
    item.hNocturnas,
    item.hExtras,
    item.hExtrasRedondeo,
    item.hECompensar,
    item.hEPagar,
    item.p25,
    item.p35,
    item.hed,
    item.p25Hed,
    item.p35Hed,
    item.hen,
    item.p25Hen,
    item.p35Hen,
    item.p100,
    item.tLaborables,
    item.tTrabajado,
    item.hCompensado,
    item.falta,
    item.just,
    item.feriado,
  ])

  const handleExportExcel = () => {
    const lines = [
      exportHeaders.map((item) => `"${item}"`).join(","),
      ...exportRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ]
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `consultar-asistencia-${fechaInicio}-${fechaFin}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPdf = () => {
    const htmlRows = exportRows.map((row) => `<tr>${row.map((cell) => `<td>${String(cell)}</td>`).join("")}</tr>`).join("")
    const win = window.open("", "_blank", "width=1400,height=900")
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Consultar asistencia ${fechaInicio} a ${fechaFin}</title>
          <style>
            @page { size: A4 landscape; margin: 8mm; }
            body { font-family: "Segoe UI", Tahoma, sans-serif; padding: 12px; color: #0f172a; }
            h1 { margin: 0 0 6px; font-size: 22px; }
            p { margin: 0 0 12px; color: #475569; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #cbd5e1; padding: 4px 6px; font-size: 9px; white-space: nowrap; }
            th { background: #0f766e; color: white; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Consultar asistencia</h1>
          <p>Periodo: ${fechaInicio} a ${fechaFin} | Registros: ${exportRows.length}</p>
          <table>
            <thead><tr>${exportHeaders.map((item) => `<th>${item}</th>`).join("")}</tr></thead>
            <tbody>${htmlRows}</tbody>
          </table>
          <script>window.onload = function () { window.print(); };</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  const handleExportRawJson = () => {
    if (rows.length === 0) {
      toast.error("No hay marcaciones en ese filtro.")
      return
    }
    const payload = {
      metadata: {
        generado_en: new Date().toISOString(),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        trabajador: selectedLabel,
        total_registros: rows.length,
      },
      registros: rows,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `consultar-asistencia-raw-${fechaInicio}-${fechaFin}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!token) return <section className="p-6 text-sm text-slate-600">Inicia sesion para continuar.</section>

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-[radial-gradient(circle_at_top_right,#dcfce7_0%,#f8fafc_45%,#eef2ff_100%)] p-3 md:p-6">
      <div className="mx-auto w-full max-w-[1800px] space-y-5">
        <header className="rounded-2xl border border-slate-700/70 bg-gradient-to-r from-[#081428] via-[#0b1730] to-[#0e1d3a] p-5 shadow-lg md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700"><FileSearch size={22} /></div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-100 md:text-3xl">Consultar asistencia</h1>
                <p className="text-sm text-slate-300">Vista completa de asistencia con todas las columnas.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleExportPdf} className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50/95 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"><Download size={16} />Exportar PDF</button>
              <button type="button" onClick={handleExportExcel} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-emerald-700"><Download size={16} />Exportar Excel</button>
              <button type="button" onClick={handleExportRawJson} className="inline-flex items-center gap-2 rounded-lg border border-slate-500 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-white"><Download size={16} />Descargar RAW (JSON)</button>
            </div>
          </div>
        </header>

        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Fecha inicio</label>
            <input type="date" className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Fecha fin</label>
            <input type="date" className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Trabajador</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsPersonalModalOpen(true)} className="flex h-10 flex-1 items-center justify-between rounded-md border border-input bg-transparent px-3 text-sm text-left text-slate-700">
                <span className="truncate">{selectedLabel}</span><Search size={16} className="shrink-0 text-slate-400" />
              </button>
              <button type="button" onClick={() => setSelectedPersonalId(null)} className="h-10 rounded-md border border-slate-300 px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50">Todos</button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          Mostrando {rows.length} registro{rows.length === 1 ? "" : "s"} entre {formatShortDate(fechaInicio)} y {formatShortDate(fechaFin)}.
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="max-h-[620px] overflow-auto">
            <table className="w-full min-w-[3600px]">
              <thead className="sticky top-0 z-10 bg-teal-700 text-white">
                <tr className="text-xs">
                  {exportHeaders.map((header) => (
                    <th key={header} className="px-3 py-3 text-left font-semibold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={43} className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500">Cargando asistencia...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={43} className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500">No hay marcaciones registradas para ese filtro.</td></tr>
                ) : (
                  rows.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.codigoEmpleado}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.numeroDocumento}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.area}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.nombresCompletos}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.turno}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.horario}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.dia}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.fecha}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hEnt}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hSal}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.mEnt}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.mSal}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.tRefrigerio}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.salRefrigerio}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.entRef}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.refTomado}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.tardRef}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.tardanza}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.eTemprano}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.conGoce}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.sinGoce}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.sTemprano}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hDiurnas}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hNocturnas}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hExtras}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hExtrasRedondeo}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hECompensar}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hEPagar}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.p25}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.p35}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hed}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.p25Hed}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.p35Hed}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hen}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.p25Hen}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.p35Hen}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.p100}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.tLaborables}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.tTrabajado}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hCompensado}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.falta}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.just}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.feriado}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isPersonalModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Seleccionar trabajador</h2>
                <p className="text-sm text-slate-500">Busca por DNI o nombre y selecciona un trabajador.</p>
              </div>
              <button type="button" onClick={() => setIsPersonalModalOpen(false)} className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-100">X</button>
            </div>
            <div className="space-y-4 p-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input className="h-10 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm" value={personalSearch} onChange={(e) => setPersonalSearch(e.target.value)} placeholder="Buscar por DNI o nombre" />
              </div>
              <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead className="sticky top-0 bg-teal-700 text-white">
                    <tr className="text-xs">
                      <th className="px-3 py-3 text-left font-semibold">Documento</th>
                      <th className="px-3 py-3 text-left font-semibold">Nombres completos</th>
                      <th className="px-3 py-3 text-center font-semibold">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalPersonales.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">No se encontraron trabajadores.</td></tr>
                    ) : (
                      modalPersonales.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.numero_documento}</td>
                          <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.nombres_completos}</td>
                          <td className="border-t border-slate-200 px-3 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPersonalId(item.id)
                                setIsPersonalModalOpen(false)
                              }}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
                            >
                              Seleccionar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPersonalId(null)
                    setIsPersonalModalOpen(false)
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Limpiar
                </button>
                <button type="button" onClick={() => setIsPersonalModalOpen(false)} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
