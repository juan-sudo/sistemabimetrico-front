"use client"

import { useMemo } from "react"
import { Download, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useDescargarMarcasPage } from "../hooks/useDescargarMarcasPage"

export default function DescargarMarcasPage() {
  const {
    token,
    tab,
    setTab,
    loading,
    downloading,
    readingRaw,
    readingCapacity,
    devices,
    filteredDevices,
    selectedIds,
    selectedIdSet,
    search,
    setSearch,
    rawPreview,
    rawPreviewText,
    capacityPreview,
    fechaInicioRaw,
    setFechaInicioRaw,
    fechaFinRaw,
    setFechaFinRaw,
    claveComunicacion,
    setClaveComunicacion,
    allSelected,
    toggleSelect,
    toggleSelectAllFiltered,
    descargarMarcaciones,
    onVerRawDispositivo,
    onVerCapacidadDispositivo,
    descargarRawPreviewJson,
  } = useDescargarMarcasPage()

  const deviceRows = useMemo(
    () =>
      filteredDevices.map((item, index) => (
        <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
          <td className="border-t border-slate-200 px-3 py-2">
            <input
              type="checkbox"
              checked={selectedIdSet.has(item.id)}
              onChange={() => toggleSelect(item.id)}
            />
          </td>
          <td className="border-t border-slate-200 px-3 py-2 text-slate-700">{item.nombre}</td>
          <td className="border-t border-slate-200 px-3 py-2 text-slate-700">{item.direccion}</td>
          <td className="border-t border-slate-200 px-3 py-2 text-slate-700">{item.puerto}</td>
          <td className="border-t border-slate-200 px-3 py-2 text-slate-700">
            {item.uso === "ASISTENCIA" ? "Control de Asistencia" : "Control de Acceso"}
          </td>
        </tr>
      )),
    [filteredDevices, selectedIdSet, toggleSelect]
  )

  if (!token) return <section className="p-6 text-sm text-slate-600">Inicia sesion para continuar.</section>

  const contentDispositivo = (
    <div className="space-y-4 rounded-b-xl border border-slate-300 bg-white p-3 md:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Seleccionados: <span className="font-semibold text-slate-900">{selectedIds.length}</span>
          <span className="ml-2 text-slate-500">(Mostrando {filteredDevices.length} de {devices.length})</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, IP, puerto o uso"
              className="h-10 w-72 max-w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm text-slate-700"
            />
          </div>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={claveComunicacion}
            onChange={(e) => setClaveComunicacion(e.target.value)}
            className="h-10 w-40 rounded-md border border-slate-300 px-3 text-sm text-slate-700"
            title="Clave de comunicacion (Comm Key)"
            placeholder="Clave (0)"
          />
          <input
            type="date"
            value={fechaInicioRaw}
            onChange={(e) => setFechaInicioRaw(e.target.value)}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm text-slate-700"
            title="Fecha inicio RAW"
          />
          <input
            type="date"
            value={fechaFinRaw}
            onChange={(e) => setFechaFinRaw(e.target.value)}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm text-slate-700"
            title="Fecha fin RAW"
          />
          <Button
            type="button"
            variant="outline"
            disabled={selectedIds.length === 0 || readingCapacity}
            onClick={onVerCapacidadDispositivo}
          >
            {readingCapacity ? "Consultando..." : "Ver Capacidad Equipo"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={selectedIds.length === 0 || readingRaw}
            onClick={onVerRawDispositivo}
          >
            {readingRaw ? "Leyendo RAW..." : "Ver RAW del Equipo"}
          </Button>
          <Button
            type="button"
            className="bg-lime-600 hover:bg-lime-700"
            disabled={selectedIds.length === 0 || downloading}
            onClick={descargarMarcaciones}
          >
            {downloading ? "Descargando..." : "Descargar Marcaciones"}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200">
        <table className="w-full min-w-[760px]">
          <thead className="bg-lime-500 text-white">
            <tr className="text-sm">
              <th className="w-10 px-3 py-2 text-left font-semibold">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleSelectAllFiltered(e.target.checked)}
                />
              </th>
              <th className="px-3 py-2 text-left font-semibold">Nombre</th>
              <th className="px-3 py-2 text-left font-semibold">IP / Dominio</th>
              <th className="px-3 py-2 text-left font-semibold">Puerto</th>
              <th className="px-3 py-2 text-left font-semibold">Uso Dispositivo</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="border-t border-slate-200 px-3 py-4 text-center text-sm text-slate-500">
                  Cargando dispositivos...
                </td>
              </tr>
            ) : null}
            {!loading ? deviceRows : null}
            {!loading && filteredDevices.length === 0 ? (
              <tr>
                <td colSpan={5} className="border-t border-slate-200 px-3 py-4 text-center text-sm text-slate-500">
                  {devices.length === 0 ? "No hay dispositivos activos." : "No hay resultados para la busqueda actual."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {!loading && devices.length === 0 ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          No hay dispositivos activos. Crea uno en{" "}
          <Link href="/dashboard/dispositivos" className="font-semibold text-emerald-700 underline">
            Dispositivos
          </Link>{" "}
          y luego vuelve aquí para descargar marcaciones.
        </div>
      ) : null}

      {rawPreview.length > 0 ? (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-700">
              Vista RAW (solo lectura): <span className="font-semibold">{rawPreview.length}</span> registros.
            </p>
            <Button type="button" variant="outline" onClick={descargarRawPreviewJson}>
              Descargar RAW JSON
            </Button>
          </div>
          <div className="max-h-72 overflow-auto rounded-md border border-slate-200 bg-white p-2">
            <pre className="text-xs text-slate-700">{rawPreviewText}</pre>
          </div>
          <p className="text-xs text-slate-500">Se muestran maximo 100 en pantalla. El JSON descargado incluye todos los registros.</p>
        </div>
      ) : null}

      {capacityPreview.length > 0 ? (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm text-slate-700">
            Capacidad de equipo (solo lectura): <span className="font-semibold">{capacityPreview.length}</span> resultado(s).
          </p>
          <div className="overflow-auto rounded-md border border-slate-200 bg-white">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left">Dispositivo</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                  <th className="px-3 py-2 text-left">Reg. Usados</th>
                  <th className="px-3 py-2 text-left">Reg. Capacidad</th>
                  <th className="px-3 py-2 text-left">Reg. Disponibles</th>
                  <th className="px-3 py-2 text-left">Usuarios</th>
                  <th className="px-3 py-2 text-left">Platform</th>
                  <th className="px-3 py-2 text-left">Firmware</th>
                  <th className="px-3 py-2 text-left">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {capacityPreview.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="border-t border-slate-200 px-3 py-2">{String(item.dispositivo ?? "-")}</td>
                    <td className="border-t border-slate-200 px-3 py-2">{String(item.estado ?? "-")}</td>
                    <td className="border-t border-slate-200 px-3 py-2">{String(item.registros_usados ?? "-")}</td>
                    <td className="border-t border-slate-200 px-3 py-2">{String(item.registros_capacidad ?? "-")}</td>
                    <td className="border-t border-slate-200 px-3 py-2">{String(item.registros_disponibles ?? "-")}</td>
                    <td className="border-t border-slate-200 px-3 py-2">{`${String(item.usuarios_usados ?? "-")} / ${String(item.usuarios_capacidad ?? "-")}`}</td>
                    <td className="border-t border-slate-200 px-3 py-2">{String(item.platform ?? "-")}</td>
                    <td className="border-t border-slate-200 px-3 py-2">{String(item.firmware ?? "-")}</td>
                    <td className="border-t border-slate-200 px-3 py-2">{String(item.detalle ?? "-")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )

  const contentPlaceholder = <div className="rounded-b-xl border border-slate-300 bg-white p-4 text-sm text-slate-500">Modulo en construccion.</div>

  return (
    <>

        <div className="rounded-xl bg-transparent">
          <div className="inline-flex">
            <button
              onClick={() => setTab("dispositivo")}
              className={`border border-slate-300 px-4 py-2 text-sm font-semibold ${tab === "dispositivo" ? "bg-lime-500 text-white" : "bg-white text-slate-700"}`}
            >
              Dispositivo
            </button>
            <button
              onClick={() => setTab("usb")}
              className={`border border-l-0 border-slate-300 px-4 py-2 text-sm font-semibold ${tab === "usb" ? "bg-lime-500 text-white" : "bg-white text-slate-700"}`}
            >
              USB
            </button>
            <button
              onClick={() => setTab("excel")}
              className={`border border-l-0 border-slate-300 px-4 py-2 text-sm font-semibold ${tab === "excel" ? "bg-lime-500 text-white" : "bg-white text-slate-700"}`}
            >
              Importacion Excel
            </button>
          </div>

          {tab === "dispositivo" && contentDispositivo}
          {tab === "usb" && contentPlaceholder}
          {tab === "excel" && contentPlaceholder}
        </div>
    </>
  )
}
