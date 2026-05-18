export type AsistenciaDia = {
  fecha: string
  attended: number
  faltas: number
  covered: number
}

export type DashboardSummary = {
  personal_total: number
  personal_activo: number
  marcaciones_mes: number
  justificaciones_total: number
  justificaciones_pendientes: number
  boletas_mes_total: number
  boletas_mes_neto: number
  dispositivos_activos: number
}

export type RecentMarcacion = {
  id: number
  personal: number
  personal_nombre: string
  fecha_hora: string
  tipo_evento: string
}

export type RecentJustificacion = {
  id: number
  personal: number
  personal_nombre: string
  motivo: string
  estado: string
  fecha_inicio: string
  fecha_fin: string
}

export type DashboardPayload = {
  summary: DashboardSummary
  asistencia_diaria: AsistenciaDia[]
  recent_marcaciones: RecentMarcacion[]
  recent_justificaciones: RecentJustificacion[]
  generated_at: string
}
