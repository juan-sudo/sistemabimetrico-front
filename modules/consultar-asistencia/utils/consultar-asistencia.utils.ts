import type { Area, FullRow, Marcacion, Personal, PersonalTurno, Turno, TurnoBloque } from "../interfaces/consultar-asistencia.interface"

export const asArray = (x: unknown): unknown[] => {
  if (Array.isArray(x)) return x
  if (x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results)) {
    return (x as { results: unknown[] }).results
  }
  return []
}

const dayNames = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]

export function formatInputDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatShortDate(value: string): string {
  const [year, month, day] = value.split("-")
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

function getDateIso(value: string): string {
  return value.slice(0, 10)
}

function getHour(value: string): string {
  const parts = value.split("T")
  if (parts.length < 2) return "-"
  return parts[1].slice(0, 5)
}

function parseMinutes(value: string): number | null {
  const [h, m] = value.split(":").map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  return h * 60 + m
}

function diffToHours(start: string, end: string): string {
  const s = parseMinutes(start)
  const e = parseMinutes(end)
  if (s === null || e === null) return "0.00"
  let d = e - s
  if (d < 0) d += 24 * 60
  return (d / 60).toFixed(2)
}

function getDayName(isoDate: string): string {
  const day = new Date(`${isoDate}T00:00:00`).getDay()
  return dayNames[day] || "-"
}

function timeRangeLabel(start: string, end: string): string {
  if (!start || !end) return "-"
  return `${start.slice(0, 5)}-${end.slice(0, 5)}`
}

export const exportHeaders = [
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

export function buildRows(params: {
  marcaciones: Marcacion[]
  personales: Personal[]
  areas: Area[]
  asignaciones: PersonalTurno[]
  turnos: Turno[]
  bloques: TurnoBloque[]
}): FullRow[] {
  const { marcaciones, personales, areas, asignaciones, turnos, bloques } = params

  const personalMap = Object.fromEntries(personales.map((item) => [item.id, item])) as Record<number, Personal>
  const areaMap = Object.fromEntries(areas.map((item) => [item.id, item.nombre])) as Record<number, string>
  const turnoMap = Object.fromEntries(turnos.map((item) => [item.id, item.nombre])) as Record<number, string>

  const bloquesByTurno: Record<number, TurnoBloque[]> = {}
  for (const block of bloques) {
    if (!bloquesByTurno[block.turno]) bloquesByTurno[block.turno] = []
    bloquesByTurno[block.turno].push(block)
  }
  Object.values(bloquesByTurno).forEach((items) => items.sort((a, b) => a.orden - b.orden))

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
      if (entM !== null && salM !== null && salM <= entM) hSal = "-"
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
}

export function buildExportRows(rows: FullRow[]): string[][] {
  return rows.map((item) => [
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
}
