import type { PayrollSlipPayload } from "@/lib/payroll-slip"

export type Personal = {
  id: number
  numero_documento: string
  nombres_completos: string
}

export type ResumenPayload = PayrollSlipPayload & {
  resumen: {
    dias_periodo: number
    dias_con_marcacion: number
    dias_justificados: number
    dias_descanso_medico: number
    dias_falta: number
  }
  faltas: string[]
  justificaciones: {
    id: number
    motivo: string
    estado: string
    fecha_inicio: string
    fecha_fin: string
    dias: number
  }[]
  descansos_medicos: {
    id: number
    motivo: string
    fecha_inicio: string
    fecha_fin: string
    dias: number
    citt: string
  }[]
  marcaciones: {
    id: number
    fecha_hora: string
    tipo_evento: string
  }[]
}

export type MonthOption = {
  value: string
  label: string
}
