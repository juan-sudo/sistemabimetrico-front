import type { MonthOption } from "../interfaces/resumen-planilla.interface"

export const asArray = (x: unknown) =>
  Array.isArray(x) ? x : x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results) ? (x as { results: unknown[] }).results : []

export const monthOptions: MonthOption[] = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
]

export function buildResumenCsvLines(params: {
  trabajador: string
  dni: string
  codigo: string
  anio: string | number
  mes: string | number
  diasConMarcacion: number | string
  diasJustificados: number | string
  diasDescansoMedico: number | string
  diasFalta: number | string
  sueldoBase: number | string
  netoPagar: number | string
}): string[] {
  return [
    "campo,valor",
    `"Trabajador","${params.trabajador}"`,
    `"DNI","${params.dni}"`,
    `"Codigo","${params.codigo}"`,
    `"Anio","${params.anio}"`,
    `"Mes","${params.mes}"`,
    `"Dias con marcacion","${params.diasConMarcacion}"`,
    `"Dias justificados","${params.diasJustificados}"`,
    `"Descanso medico","${params.diasDescansoMedico}"`,
    `"Faltas","${params.diasFalta}"`,
    `"Sueldo base","${params.sueldoBase}"`,
    `"Neto a pagar","${params.netoPagar}"`,
  ]
}

export function downloadCsv(filename: string, lines: string[]) {
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
