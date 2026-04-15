import type { PersonalBoleta } from "../interfaces/boleta-mensual"

export const monthOptions = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
]

export const getYearOptions = () => {
  const y = new Date().getFullYear()
  return [y - 1, y, y + 1]
}

export const PEN = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
})

export const asArray = <T>(x: unknown): T[] =>
  Array.isArray(x) ? x : x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results) ? ((x as { results: unknown[] }).results as T[]) : []

export const getPeriodo = (month: string, year: string) => {
  const m = monthOptions.find((x) => x.value === month)?.label ?? month
  return `${m} ${year}`
}

export const getCsvLines = (rows: PersonalBoleta[], period: string) => [
  "documento,nombres,area,tipo_trabajador,sueldo_base,periodo",
  ...rows.map((x) => `"${x.documento}","${x.nombres.replace(/"/g, '""')}","${x.area}","${x.tipoTrabajador}",${x.sueldoBase},"${period}"`),
]

export const buildPrintHtml = (rows: PersonalBoleta[], period: string) => {
  const htmlRows = rows
    .map(
      (x) => `
        <tr>
          <td>${x.documento}</td>
          <td>${x.nombres}</td>
          <td>${x.area}</td>
          <td>${x.tipoTrabajador}</td>
          <td style="text-align:right">${PEN.format(x.sueldoBase)}</td>
        </tr>
      `
    )
    .join("")

  return `
    <html>
      <head>
        <title>Boletas ${period}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { margin: 0 0 8px; font-size: 22px; }
          p { margin: 0 0 16px; color: #334155; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 13px; }
          th { background: #65a30d; color: white; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Boleta de personal por mes</h1>
        <p>Periodo: ${period} | Seleccionados: ${rows.length}</p>
        <table>
          <thead>
            <tr>
              <th>Documento</th>
              <th>Nombres completos</th>
              <th>Area</th>
              <th>Tipo trabajador</th>
              <th>Sueldo base</th>
            </tr>
          </thead>
          <tbody>${htmlRows}</tbody>
        </table>
        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `
}
