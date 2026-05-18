import type { Area, FullRow, JustificacionLite, Marcacion, Personal, PersonalTurno, Turno, TurnoBloque } from "../interfaces/consultar-asistencia.interface"

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

function getDayName(isoDate: string): string {
  const day = new Date(`${isoDate}T00:00:00`).getDay()
  return dayNames[day] || "-"
}

function timeRangeLabel(start: string, end: string): string {
  if (!start || !end) return "-"
  return `${start.slice(0, 5)}-${end.slice(0, 5)}`
}

/** Convierte minutos totales a "HH:MM" */
function minsToHHMM(mins: number): string {
  if (mins <= 0) return "0"
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}

/** Convierte minutos a horas decimales "X.XX" */
function minsToHours(mins: number): string {
  return (mins / 60).toFixed(2)
}

/** Parsea DD/MM/YYYY → YYYY-MM-DD para ordenamiento */
function sortKey(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split("/")
  return `${y ?? ""}-${m ?? ""}-${d ?? ""}`
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
  personales?: Personal[]
  areas: Area[]
  asignaciones: PersonalTurno[]
  turnos: Turno[]
  bloques: TurnoBloque[]
  justificaciones?: JustificacionLite[]
}): FullRow[] {
  const { marcaciones, personales = [], areas, asignaciones, turnos, bloques, justificaciones = [] } = params

  // ── Mapas de búsqueda rápida ──────────────────────────────────────────────
  const personalMap = Object.fromEntries(personales.map((p) => [p.id, p])) as Record<number, Personal>
  const areaMap = Object.fromEntries(areas.map((a) => [a.id, a.nombre])) as Record<number, string>
  const turnoMap = Object.fromEntries(turnos.map((t) => [t.id, t.nombre])) as Record<number, string>

  const bloquesByTurno: Record<number, TurnoBloque[]> = {}
  for (const b of bloques) {
    if (!bloquesByTurno[b.turno]) bloquesByTurno[b.turno] = []
    bloquesByTurno[b.turno].push(b)
  }
  for (const list of Object.values(bloquesByTurno)) {
    list.sort((a, b) => a.orden - b.orden)
  }

  const justIntervalsByPersonal: Record<number, Array<{ start: string; end: string }>> = {}
  for (const j of justificaciones) {
    if (!j || j.estado !== "AUTORIZADO") continue
    const start = String(j.fecha_inicio || "").slice(0, 10)
    const end = String(j.fecha_fin || "").slice(0, 10)
    if (!start || !end) continue
    if (!justIntervalsByPersonal[j.personal]) justIntervalsByPersonal[j.personal] = []
    justIntervalsByPersonal[j.personal].push({ start, end })
  }

  const isJustified = (personalId: number, fechaIso: string) => {
    const intervals = justIntervalsByPersonal[personalId]
    if (!intervals || intervals.length === 0) return false
    // ISO (YYYY-MM-DD) se compara lexicográficamente
    for (const it of intervals) {
      if (it.start <= fechaIso && fechaIso <= it.end) return true
    }
    return false
  }

  // ── Agrupar marcaciones por personal + día ────────────────────────────────
  const grouped: Record<string, Marcacion[]> = {}
  for (const m of marcaciones) {
    const key = `${m.personal}::${getDateIso(m.fecha_hora)}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  }

  const resolved: FullRow[] = []

  for (const [key, marks] of Object.entries(grouped)) {
    const [personalRaw, fechaIso] = key.split("::")
    const personalId = Number(personalRaw)
    const person = personalMap[personalId]

    // Ordenar todas las marcas del día cronológicamente
    const sorted = [...marks].sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora))

    // Separar entradas y salidas en orden cronológico
    const entriesSorted = sorted.filter((m) => m.tipo_evento === "ENTRADA")
    const exitsSorted = sorted.filter((m) => m.tipo_evento === "SALIDA")

    // ── Asignación de turno vigente para esta fecha ──────────────────────
    const activeAssignment =
      asignaciones.find(
        (a) => a.personal === personalId && a.fecha_inicio <= fechaIso && (!a.fecha_fin || a.fecha_fin >= fechaIso),
      ) ?? null

    const turnoNombre = activeAssignment ? (turnoMap[activeAssignment.turno] ?? "-") : "-"
    const turnoBloques = activeAssignment ? (bloquesByTurno[activeAssignment.turno] ?? []) : []

    // ── Horario programado (del turno) ────────────────────────────────────
    // H.Ent. = hora entrada del primer bloque
    // H.Sal. = hora salida del último bloque
    const hEnt = turnoBloques.length > 0 ? (turnoBloques[0].hora_entrada.slice(0, 5) || "-") : "-"
    const hSal = turnoBloques.length > 0 ? (turnoBloques[turnoBloques.length - 1].hora_salida.slice(0, 5) || "-") : "-"

    // T.Laborables = suma de duración de cada bloque del turno
    let tLaborablesMins = 0
    for (const bloque of turnoBloques) {
      const e = parseMinutes(bloque.hora_entrada.slice(0, 5))
      const s = parseMinutes(bloque.hora_salida.slice(0, 5))
      if (e !== null && s !== null) {
        let diff = s - e
        if (diff < 0) diff += 24 * 60
        tLaborablesMins += diff
      }
    }

    // T.Refrigerio = brecha entre bloque 1 salida y bloque 2 entrada
    // Ej: bloque1 07:30-13:00, bloque2 15:00-18:00 → refrigerio = 120 min
    let tRefrigerioMins = 0
    if (turnoBloques.length >= 2) {
      const s1 = parseMinutes(turnoBloques[0].hora_salida.slice(0, 5))
      const e2 = parseMinutes(turnoBloques[1].hora_entrada.slice(0, 5))
      if (s1 !== null && e2 !== null && e2 > s1) tRefrigerioMins = e2 - s1
    }

    // ── Las 4 marcas del día ───────────────────────────────────────────────
    // Marca 1: primera ENTRADA del día        → M.Ent.
    // Marca 2: primera SALIDA del día         → Sal.Refrigerio  (solo si hay ≥2 salidas)
    // Marca 3: segunda ENTRADA del día        → Ent.Ref.        (solo si hay ≥2 entradas)
    // Marca 4: última SALIDA del día          → M.Sal.
    // Reglas:
    // - La marca debe cuadrar con los bloques del turno.
    // - Si SALIDA es antes de la hora programada del bloque, no se considera (queda "-").
    // - Tardanza se evalúa contra entrada programada + tolerancia (5 min).
    const GRACE_MINS = 5

    const toMin = (m: Marcacion) => {
      const h = getHour(m.fecha_hora)
      if (h === "-") return null
      return parseMinutes(h)
    }

    const b1 = turnoBloques[0] ?? null
    const b2 = turnoBloques.length >= 2 ? turnoBloques[1] : null
    const b1Start = b1 ? parseMinutes(b1.hora_entrada.slice(0, 5)) : null
    const b1End = b1 ? parseMinutes(b1.hora_salida.slice(0, 5)) : null
    const b2Start = b2 ? parseMinutes(b2.hora_entrada.slice(0, 5)) : null
    const b2End = b2 ? parseMinutes(b2.hora_salida.slice(0, 5)) : null

    const cut = b2Start
    const hasTwoBlocks = cut !== null

    const morningEntries = entriesSorted.filter((m) => {
      const t = toMin(m)
      if (t === null) return false
      return hasTwoBlocks ? t < cut! : true
    })
    const afternoonEntries = entriesSorted.filter((m) => {
      const t = toMin(m)
      if (t === null) return false
      return hasTwoBlocks ? t >= cut! : false
    })

    const morningExits = exitsSorted.filter((m) => {
      const t = toMin(m)
      if (t === null) return false
      return hasTwoBlocks ? t < cut! : true
    })
    const afternoonExits = exitsSorted.filter((m) => {
      const t = toMin(m)
      if (t === null) return false
      return hasTwoBlocks ? t >= cut! : true
    })

    const morningEntry = morningEntries[0] ?? null
    const afternoonEntry = afternoonEntries[0] ?? null

    const morningExitCandidate =
      morningExits
        .filter((m) => {
          if (b1End === null) return true
          const t = toMin(m)
          return t !== null && t >= b1End
        })
        .at(-1) ?? null

    const afternoonExitCandidate =
      afternoonExits
        .filter((m) => {
          if (b2End === null) return true
          const t = toMin(m)
          return t !== null && t >= b2End
        })
        .at(-1) ?? null

    const mEnt = morningEntry ? getHour(morningEntry.fecha_hora) : "-"
    const salRefrigerio = hasTwoBlocks && morningExitCandidate ? getHour(morningExitCandidate.fecha_hora) : "-"
    const entRef = hasTwoBlocks && afternoonEntry ? getHour(afternoonEntry.fecha_hora) : "-"
    const exitForMSal = hasTwoBlocks ? afternoonExitCandidate : morningExitCandidate
    const mSal = exitForMSal ? getHour(exitForMSal.fecha_hora) : "-"

    // ── Refrigerio tomado (real) ──────────────────────────────────────────
    // Ref.Tomado = Ent.Ref. − Sal.Refrigerio (en minutos)
    let refTomadoMins = 0
    if (salRefrigerio !== "-" && entRef !== "-") {
      const s = parseMinutes(salRefrigerio)
      const e = parseMinutes(entRef)
      if (s !== null && e !== null && e > s) refTomadoMins = e - s
    }

    // Tard.Ref = max(0, RefTomado − T.Refrigerio)
    const tardRefMins = Math.max(0, refTomadoMins - tRefrigerioMins)

    // ── Tardanza / Entrada temprana / Salida temprana ─────────────────────
    // Tardanza: suma por bloque contra entrada_programada + tolerancia (5 min)
    let tardanzaMins = 0
    const mEntMin = morningEntry ? toMin(morningEntry) : null
    const entRefMin = afternoonEntry ? toMin(afternoonEntry) : null
    if (mEntMin !== null && b1Start !== null) {
      const limit = b1Start + GRACE_MINS
      if (mEntMin > limit) tardanzaMins += mEntMin - limit
    }
    if (entRefMin !== null && b2Start !== null) {
      const limit = b2Start + GRACE_MINS
      if (entRefMin > limit) tardanzaMins += entRefMin - limit
    }

    // E.Temprano = max(0, H.Ent. − M.Ent.) en minutos
    let eTempranoMins = 0
    if (mEnt !== "-" && hEnt !== "-") {
      const actual = parseMinutes(mEnt)
      const prog = parseMinutes(hEnt)
      if (actual !== null && prog !== null && actual < prog) eTempranoMins = prog - actual
    }

    // S.Temprano = max(0, H.Sal. − M.Sal.) en minutos
    let sTempranoMins = 0
    if (mSal !== "-" && hSal !== "-") {
      const actual = parseMinutes(mSal)
      const prog = parseMinutes(hSal)
      if (actual !== null && prog !== null && actual < prog) sTempranoMins = prog - actual
    }

    // ── Horas trabajadas (real) ───────────────────────────────────────────
    // T.Trabajado = (M.Sal. − M.Ent.) − Ref.Tomado
    // Si hay 2 bloques, sumar (salida - entrada) por bloque (no restar refrigerio).
    let tTrabajadoMins = 0
    const salRefMin = morningExitCandidate ? toMin(morningExitCandidate) : null
    const mSalMin = exitForMSal ? toMin(exitForMSal) : null

    if (hasTwoBlocks) {
      if (mEntMin !== null && salRefMin !== null && salRefMin >= mEntMin) {
        tTrabajadoMins += salRefMin - mEntMin
      }
      if (entRefMin !== null && mSalMin !== null && mSalMin >= entRefMin) {
        tTrabajadoMins += mSalMin - entRefMin
      }
    } else {
      if (mEntMin !== null && mSalMin !== null && mSalMin >= mEntMin) {
        tTrabajadoMins += mSalMin - mEntMin
      }
    }

    // Fallback: si no se pudo calcular, conservar el cálculo continuo (menos refrigerio).
    if (tTrabajadoMins === 0 && mEnt !== "-" && mSal !== "-") {
      const e = parseMinutes(mEnt)
      const s = parseMinutes(mSal)
      if (e !== null && s !== null) {
        let total = s - e
        if (total < 0) total += 24 * 60
        tTrabajadoMins = Math.max(0, total - refTomadoMins)
      }
    }

    // ── Horas extras ──────────────────────────────────────────────────────
    // H.Extras = max(0, T.Trabajado − T.Laborables)
    const hExtrasMins = Math.max(0, tTrabajadoMins - tLaborablesMins)
    // H.Extras Redondeo = baja al múltiplo de 30 min más cercano
    const hExtrasRedondeoMins = Math.floor(hExtrasMins / 30) * 30

    resolved.push({
      id: sorted[0]?.id ?? 0,
      codigoEmpleado: person?.codigo_empleado ?? sorted[0]?.personal_codigo_empleado ?? "-",
      numeroDocumento: person?.numero_documento ?? sorted[0]?.personal_numero_documento ?? "-",
      area: areaMap[person?.area ?? sorted[0]?.personal_area ?? 0] ?? "-",
      nombresCompletos: person?.nombres_completos ?? sorted[0]?.personal_nombres_completos ?? "-",
      turno: turnoNombre,
      horario: hEnt !== "-" && hSal !== "-" ? timeRangeLabel(hEnt, hSal) : "-",
      dia: getDayName(fechaIso),
      fecha: formatShortDate(fechaIso),
      // Horario programado
      hEnt,
      hSal,
      // Marcas reales (del biométrico)
      mEnt,
      mSal,
      // Refrigerio
      tRefrigerio: minsToHHMM(tRefrigerioMins),
      salRefrigerio,
      entRef,
      refTomado: refTomadoMins.toString(),
      tardRef: tardRefMins.toString(),
      // Incidencias
      tardanza: tardanzaMins > 0 ? `T ${tardanzaMins}` : "0",
      eTemprano: eTempranoMins.toString(),
      conGoce: "0",
      sinGoce: "0",
      sTemprano: sTempranoMins.toString(),
      // Horas trabajadas
      hDiurnas: minsToHours(tTrabajadoMins),
      hNocturnas: "0.00",
      hExtras: minsToHours(hExtrasMins),
      hExtrasRedondeo: minsToHours(hExtrasRedondeoMins),
      hECompensar: "0.00",
      hEPagar: minsToHours(hExtrasRedondeoMins),
      // Porcentajes HE (0 — pendiente lógica salarial)
      p25: "0.00",
      p35: "0.00",
      hed: "0.00",
      p25Hed: "0.00",
      p35Hed: "0.00",
      hen: "0.00",
      p25Hen: "0.00",
      p35Hen: "0.00",
      p100: "0.00",
      // Totales del día
      tLaborables: minsToHours(tLaborablesMins),
      tTrabajado: minsToHours(tTrabajadoMins),
      hCompensado: "0.00",
      falta: "0",
      just: tardanzaMins > 0 && isJustified(personalId, fechaIso) ? "J" : "0",
      feriado: "0",
    })
  }

  // Ordenar: por fecha ISO (YYYY-MM-DD) luego por nombre
  return resolved.sort((a, b) => {
    const da = sortKey(a.fecha)
    const db = sortKey(b.fecha)
    if (da !== db) return da.localeCompare(db)
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
