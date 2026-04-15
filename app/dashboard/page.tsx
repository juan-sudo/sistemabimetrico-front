"use client"

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { useEffect, useMemo, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { apiEndpoints, authRequest } from "@/lib/api-client"
import useUserStore from "@/stores/useUserStore"

type DashboardSummary = {
  personal_total: number
  personal_activo: number
  marcaciones_mes: number
  justificaciones_total: number
  justificaciones_pendientes: number
  boletas_mes_total: number
  boletas_mes_neto: number
  dispositivos_activos: number
}

type AsistenciaDia = {
  fecha: string
  attended: number
  faltas: number
  covered: number
}

type RecentMarcacion = {
  id: number
  personal: number
  personal_nombre: string
  fecha_hora: string
  tipo_evento: string
}

type RecentJustificacion = {
  id: number
  personal: number
  personal_nombre: string
  motivo: string
  estado: string
  fecha_inicio: string
  fecha_fin: string
}

type DashboardPayload = {
  summary: DashboardSummary
  asistencia_diaria: AsistenciaDia[]
  recent_marcaciones: RecentMarcacion[]
  recent_justificaciones: RecentJustificacion[]
  generated_at: string
}

const CACHE_KEY = "dashboard:resumen:v1"
const CACHE_TTL_MS = 60 * 1000

function readCache(): DashboardPayload | null {
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { ts: number; data: DashboardPayload }
    if (!parsed?.ts || !parsed?.data) return null
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null
    return parsed.data
  } catch {
    return null
  }
}

function writeCache(data: DashboardPayload) {
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    // noop
  }
}

export default function Page() {
  const token = useUserStore((s) => s.accessToken)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("15")
  const [data, setData] = useState<DashboardPayload | null>(null)

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      const cached = readCache()
      if (cached) {
        setData(cached)
        setLoading(false)
      }

      try {
        const response = (await authRequest(`${apiEndpoints.dashboardResumen}?days=30`, {
          token,
        })) as DashboardPayload
        setData(response)
        writeCache(response)
      } catch (err) {
        if (!cached) {
          toast.error(err instanceof Error ? err.message : "No se pudo cargar el dashboard")
        }
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [token])

  const summary = data?.summary
  const asistenciaDiaria = data?.asistencia_diaria ?? []
  const recentMarcaciones = data?.recent_marcaciones ?? []
  const recentJustificaciones = data?.recent_justificaciones ?? []

  const filteredAsistenciaDiaria = useMemo(() => {
    const days = Number(timeRange)
    return asistenciaDiaria.slice(Math.max(asistenciaDiaria.length - days, 0))
  }, [asistenciaDiaria, timeRange])

  const faltasMayoresDias = useMemo(
    () => filteredAsistenciaDiaria.filter((item) => item.faltas > item.attended).length,
    [filteredAsistenciaDiaria]
  )

  if (!token) return <section className="p-6 text-sm text-slate-600">Inicia sesion para continuar.</section>

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:px-6">
        <SummaryCard
          title="Personal Activo"
          value={loading ? "..." : String(summary?.personal_activo ?? 0)}
          badge={`${summary?.personal_total ?? 0} total`}
          up
          footer1="Trabajadores registrados"
          footer2="Incluye personal activo e inactivo"
        />
        <SummaryCard
          title="Marcaciones Del Mes"
          value={loading ? "..." : String(summary?.marcaciones_mes ?? 0)}
          badge={`${summary?.dispositivos_activos ?? 0} disp.`}
          up
          footer1="Marcaciones descargadas"
          footer2="Periodo actual"
        />
        <SummaryCard
          title="Justificaciones Pendientes"
          value={loading ? "..." : String(summary?.justificaciones_pendientes ?? 0)}
          badge={`${summary?.justificaciones_total ?? 0} total`}
          up={(summary?.justificaciones_pendientes ?? 0) === 0}
          footer1="Requieren revision"
          footer2="Autorizacion institucional"
        />
        <SummaryCard
          title="Planilla Del Mes"
          value={loading ? "..." : `S/ ${Number(summary?.boletas_mes_neto ?? 0).toFixed(2)}`}
          badge={`${summary?.boletas_mes_total ?? 0} boletas`}
          up
          footer1="Neto acumulado"
          footer2="Boletas generadas del mes"
        />
      </div>

      <div className="px-4 lg:px-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Tendencia De Asistencia</h2>
              <p className="mt-1 text-sm text-slate-500">Asistencias y faltas del periodo actual en el tiempo</p>
            </div>
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setTimeRange("30")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  timeRange === "30" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Ultimos 30 dias
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("15")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  timeRange === "15" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Ultimos 15 dias
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("7")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  timeRange === "7" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Ultimos 7 dias
              </button>
            </div>
          </div>

          <div className="px-6 py-5">
            {loading ? (
              <p className="text-sm text-slate-400">Cargando tendencia diaria...</p>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">Dias con faltas altas: {faltasMayoresDias}</Badge>
                  <Badge variant="outline" className="border-slate-200 bg-white text-emerald-700">Promedio asistencia: {formatAverage(filteredAsistenciaDiaria, "attended")}</Badge>
                  <Badge variant="outline" className="border-slate-200 bg-white text-rose-700">Promedio faltas: {formatAverage(filteredAsistenciaDiaria, "faltas")}</Badge>
                  <Badge variant="outline" className="border-slate-200 bg-white text-amber-700">Promedio cubiertos: {formatAverage(filteredAsistenciaDiaria, "covered")}</Badge>
                </div>

                <div className="h-[360px] min-h-[260px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260} debounce={50}>
                    <AreaChart data={filteredAsistenciaDiaria}>
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
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-4 lg:grid-cols-2 lg:px-6">
        <Card className="shadow-sm dark:border-slate-700/80 dark:bg-gradient-to-b dark:from-[#0f1f3a] dark:to-[#0c1830] dark:text-slate-100">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Ultimas Marcaciones</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-300">Ultimos registros biometricos descargados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">Cargando...</p>
            ) : recentMarcaciones.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">No hay marcaciones registradas.</p>
            ) : recentMarcaciones.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/20">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.personal_nombre || `#${item.personal}`}</p>
                  <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-100">{item.tipo_evento}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{new Date(item.fecha_hora).toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm dark:border-slate-700/80 dark:bg-gradient-to-b dark:from-[#0f1f3a] dark:to-[#0c1830] dark:text-slate-100">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Ultimas Justificaciones</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-300">Resumen de solicitudes recientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">Cargando...</p>
            ) : recentJustificaciones.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">No hay justificaciones registradas.</p>
            ) : recentJustificaciones.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/20">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.personal_nombre || `#${item.personal}`}</p>
                  <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-100">{item.estado}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{item.motivo}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  badge,
  up,
  footer1,
  footer2,
}: {
  title: string
  value: string
  badge: string
  up: boolean
  footer1: string
  footer2: string
}) {
  return (
    <Card className="shadow-sm dark:border-slate-700/80 dark:bg-gradient-to-b dark:from-[#0f1f3a] dark:to-[#0c1830] dark:text-slate-100">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardDescription className="text-slate-500 dark:text-slate-300">{title}</CardDescription>
          <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</CardTitle>
        </div>
        <Badge variant="outline" className="flex items-center gap-1 border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-100">
          {up ? <IconTrendingUp size={16} /> : <IconTrendingDown size={16} />}
          {badge}
        </Badge>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
          {footer1}
          {up ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
        </div>
        <div className="text-slate-500 dark:text-slate-300">{footer2}</div>
      </CardFooter>
    </Card>
  )
}

function formatAverage(
  rows: { attended: number; faltas: number; covered: number }[],
  key: "attended" | "faltas" | "covered"
) {
  if (rows.length === 0) return "0"
  const total = rows.reduce((acc, item) => acc + item[key], 0)
  return (total / rows.length).toFixed(1)
}
