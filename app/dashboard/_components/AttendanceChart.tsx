"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import type { AsistenciaDia } from "./dashboard-home.types"

function formatAverage(rows: AsistenciaDia[], key: keyof Pick<AsistenciaDia, "attended" | "faltas" | "covered">) {
  if (rows.length === 0) return "0"
  const total = rows.reduce((acc, item) => acc + item[key], 0)
  return (total / rows.length).toFixed(1)
}

export default function AttendanceChart({
  loading,
  rows,
}: {
  loading: boolean
  rows: AsistenciaDia[]
}) {
  if (loading) {
    return <p className="text-sm text-slate-400">Cargando tendencia diaria...</p>
  }

  const faltasMayoresDias = rows.filter((item) => item.faltas > item.attended).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 text-xs">
        <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">Dias con faltas altas: {faltasMayoresDias}</Badge>
        <Badge variant="outline" className="border-slate-200 bg-white text-emerald-700">Promedio asistencia: {formatAverage(rows, "attended")}</Badge>
        <Badge variant="outline" className="border-slate-200 bg-white text-rose-700">Promedio faltas: {formatAverage(rows, "faltas")}</Badge>
        <Badge variant="outline" className="border-slate-200 bg-white text-amber-700">Promedio cubiertos: {formatAverage(rows, "covered")}</Badge>
      </div>

      <div className="h-[360px] min-h-[260px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260} debounce={50}>
          <AreaChart data={rows}>
            <defs>
              <linearGradient id="fillAttendDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f172a" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#0f172a" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillMissingDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis
              dataKey="fecha"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              stroke="#64748b"
              tickFormatter={(value) => {
                const [, month, day] = String(value).split("-")
                return `${day}/${month}`
              }}
            />
            <YAxis tickLine={false} axisLine={false} width={36} stroke="#64748b" />
            <Tooltip
              contentStyle={{
                borderRadius: 14,
                borderColor: "#cbd5e1",
                backgroundColor: "#ffffff",
                color: "#0f172a",
              }}
              formatter={(value, name) => [
                Number(value ?? 0),
                name === "attended" ? "Asistencias" : "Faltas",
              ]}
              labelFormatter={(label) => `Fecha: ${label}`}
            />
            <Area type="monotone" dataKey="faltas" stroke="#94a3b8" fill="url(#fillMissingDark)" strokeWidth={2} />
            <Area type="monotone" dataKey="attended" stroke="#0f172a" fill="url(#fillAttendDark)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
