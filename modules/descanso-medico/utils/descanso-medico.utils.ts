import type { Descanso, DescansoForm, Personal } from "../interfaces/descanso-medico.interface"

export const SEARCH_DEBOUNCE_MS = 350

export const defaultForm: DescansoForm = {
  motivo: "",
  fecha_inicio: "",
  fecha_fin: "",
  dias: "1",
  citt: "",
  diagnostico: "",
  tiene_adjunto: false,
  numero_documento: "",
}

export const asList = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === "object" && Array.isArray((value as { results?: unknown[] }).results)) {
    return (value as { results: T[] }).results
  }
  return []
}

export function buildDescansoExportRows(rows: Descanso[]) {
  return rows.map((row) => ({
    nombres: row.personal_nombres_completos || "-",
    dni: row.personal_numero_documento || "-",
    motivo: row.motivo === "SALUD" ? "Por salud" : "Subsidio",
    fechaInicio: row.fecha_inicio,
    fechaFin: row.fecha_fin,
    dias: row.dias,
    citt: row.citt || "-",
    diagnostico: row.diagnostico || "-",
    adjunto: row.tiene_adjunto ? "SI" : "NO",
    nroDoc: row.numero_documento || "-",
  }))
}

export function buildPersonalProfileFromDescanso(row: Descanso): Personal {
  return {
    id: row.personal,
    codigo_empleado: row.personal_codigo_empleado || "-",
    numero_documento: row.personal_numero_documento || "-",
    nombres_completos: row.personal_nombres_completos || "-",
    sucursal: row.personal_sucursal || 0,
    area: row.personal_area || 0,
    cargo: null,
    estado: "ACTIVO",
    correo: "",
    telefono: "",
    fecha_ingreso: null,
  }
}
