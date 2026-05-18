"use client"

import dynamic from "next/dynamic"
import { TrendingDown, TrendingUp } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { apiEndpoints, authRequest } from "@/lib/api-client"
import useUserStore from "@/stores/useUserStore"
import type { DashboardPayload, AsistenciaDia } from "./dashboard-home.types"

const AttendanceChart = dynamic(() => import("./AttendanceChart"), {
  ssr: false,
  loading: () => <div className="h-[360px] w-full animate-pulse rounded-xl bg-slate-100" />,
})

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
    // ignore storage errors
  }
}

export function DashboardHomeClient({
  initialData,
}: {
  initialData: DashboardPayload | null
}) {
  const token = useUserStore((state) => state.accessToken)
  const [loading, setLoading] = useState(!initialData)
  const [timeRange, setTimeRange] = useState("15")
  const [data, setData] = useState<DashboardPayload | null>(initialData)

  useEffect(() => {
    if (initialData) {
      writeCache(initialData)
    }
  }, [initialData])

  useEffect(() => {
    const run = async () => {
      const cached = readCache()

      if (!initialData && cached) {
        setData(cached)
        setLoading(false)
      }

      if (!token) {
        if (!initialData && !cached) {
          setLoading(false)
        }
        return
      }

      try {
        const response = (await authRequest(`${apiEndpoints.dashboardResumen}?days=30`, {
          token,
        })) as DashboardPayload
        setData(response)
        writeCache(response)
      } catch (err) {
        if (!initialData && !cached) {
          toast.error(err instanceof Error ? err.message : "No se pudo cargar el dashboard")
        }
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [initialData, token])

  const summary = data?.summary
  const asistenciaDiaria = data?.asistencia_diaria ?? []
  const recentMarcaciones = data?.recent_marcaciones ?? []
  const recentJustificaciones = data?.recent_justificaciones ?? []

  const filteredAsistenciaDiaria = useMemo(() => {
    const days = Number(timeRange)
    return asistenciaDiaria.slice(Math.max(asistenciaDiaria.length - days, 0))
  }, [asistenciaDiaria, timeRange])

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:px-6">
        <SummaryCard
          title="Personal Activo"
          value={loading ? null : String(summary?.personal_activo ?? 0)}
          badge={`${summary?.personal_total ?? 0} total`}
          up
          footer1="Trabajadores registrados"
          footer2="Incluye personal activo e inactivo"
        />
        <SummaryCard
          title="Marcaciones Del Mes"
          value={loading ? null : String(summary?.marcaciones_mes ?? 0)}
          badge={`${summary?.dispositivos_activos ?? 0} disp.`}
          up
          footer1="Marcaciones descargadas"
          footer2="Periodo actual"
        />
        <SummaryCard
          title="Justificaciones Pendientes"
          value={loading ? null : String(summary?.justificaciones_pendientes ?? 0)}
          badge={`${summary?.justificaciones_total ?? 0} total`}
          up={(summary?.justificaciones_pendientes ?? 0) === 0}
          footer1="Requieren revision"
          footer2="Autorizacion institucional"
        />
        <SummaryCard
          title="Planilla Del Mes"
          value={loading ? null : `S/ ${Number(summary?.boletas_mes_neto ?? 0).toFixed(2)}`}
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
              {(["30", "15", "7"] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    timeRange === range ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Ultimos {range} dias
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 py-5">
            <AttendanceChart loading={loading} rows={filteredAsistenciaDiaria} />
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
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
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
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
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
  value: string | null
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
          {value === null ? (
            <Skeleton className="mt-1 h-8 w-24" />
          ) : (
            <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</CardTitle>
          )}
        </div>
        <Badge variant="outline" className="flex items-center gap-1 border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-100">
          {up ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {badge}
        </Badge>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
          {footer1}
          {up ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
        </div>
        <div className="text-slate-500 dark:text-slate-300">{footer2}</div>
      </CardFooter>
    </Card>
  )
}
