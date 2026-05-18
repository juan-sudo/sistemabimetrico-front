"use client"

import { Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useConsultarAsistenciaPage } from "../hooks/useConsultarAsistenciaPage"

export default function ConsultarAsistenciaPage() {
  const {
    token,
    loading,
    initialLoading,
    isFetching,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    isPersonalModalOpen,
    setIsPersonalModalOpen,
    personalSearch,
    setPersonalSearch,
    selectedLabel,
    rows,
    modalPersonales,
    modalLoading,
    modalPage,
    setModalPage,
    modalTotalPages,
    modalCanPrev,
    modalCanNext,
    totalItems,
    page,
    setPage,
    totalPages,
    canPrev,
    canNext,
    exportHeaders,
    formatShortDate,
    handleSelectPersonal,
    handleClearPersonal,
    handleExportExcel,
    handleExportPdf,
    handleExportRawJson,
  } = useConsultarAsistenciaPage()

  if (!token) return <section className="p-6 text-sm text-slate-600">Inicia sesion para continuar.</section>

  return (
    <>
      <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2 rounded-2xl border border-white/50 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
              <button type="button" onClick={handleExportPdf} className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50/95 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"><Download size={16} />Exportar PDF</button>
              <button type="button" onClick={handleExportExcel} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-emerald-700"><Download size={16} />Exportar Excel</button>
              <button type="button" onClick={handleExportRawJson} className="inline-flex items-center gap-2 rounded-lg border border-slate-500 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-white"><Download size={16} />Descargar RAW (JSON)</button>
            </div>

        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <span className="whitespace-nowrap">Fecha inicio</span>
            <input
              type="date"
              className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <span className="whitespace-nowrap">Fecha fin</span>
            <input
              type="date"
              className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <span className="whitespace-nowrap">Trabajador</span>
            <button
              type="button"
              onClick={() => setIsPersonalModalOpen(true)}
              className="flex h-10 w-[320px] max-w-[70vw] items-center justify-between rounded-md border border-input bg-transparent px-3 text-sm text-left text-slate-700"
            >
              <span className="truncate">{selectedLabel}</span>
              <Search size={16} className="shrink-0 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={handleClearPersonal}
              className="h-10 rounded-md border border-slate-300 px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Todos
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          {initialLoading ? "Cargando..." : isFetching ? "Actualizando..." : `Mostrando ${rows.length} registro${rows.length === 1 ? "" : "s"} de ${totalItems} entre ${formatShortDate(fechaInicio)} y ${formatShortDate(fechaFin)}.`}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="max-h-[620px] overflow-auto">
            <table className="w-full min-w-[3600px]">
              <thead className="sticky top-0 z-10 bg-teal-700 text-white">
                <tr className="text-xs">
                  {exportHeaders.map((header) => (
                    <th key={header} className="px-3 py-3 text-left font-semibold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={43} className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500">Cargando asistencia...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={43} className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500">No hay marcaciones registradas para ese filtro.</td></tr>
                ) : (
                  rows.map((item, index) => (
                    <tr key={`${item.codigoEmpleado}-${item.fecha}`} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.codigoEmpleado}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.numeroDocumento}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.area}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.nombresCompletos}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.turno}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.horario}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.dia}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.fecha}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hEnt}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hSal}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.mEnt}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.mSal}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.tRefrigerio}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.salRefrigerio}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.entRef}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.refTomado}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.tardRef}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.tardanza}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.eTemprano}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.conGoce}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.sinGoce}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.sTemprano}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hDiurnas}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hNocturnas}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hExtras}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hExtrasRedondeo}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hECompensar}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hEPagar}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.p25}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.p35}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hed}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.p25Hed}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.p35Hed}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hen}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.p25Hen}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.p35Hen}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.p100}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.tLaborables}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.tTrabajado}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.hCompensado}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.falta}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.just}</td>
                      <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.feriado}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="px-1 text-sm font-semibold text-slate-700">Pagina {page} de {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={!canPrev || loading}>
              Anterior
            </Button>
            <Button type="button" variant="outline" onClick={() => setPage((prev) => prev + 1)} disabled={!canNext || loading}>
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      {isPersonalModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Seleccionar trabajador</h2>
                <p className="text-sm text-slate-500">Busca por DNI o nombre y selecciona un trabajador.</p>
              </div>
              <button type="button" onClick={() => setIsPersonalModalOpen(false)} className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-100">X</button>
            </div>
            <div className="space-y-4 p-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input className="h-10 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm" value={personalSearch} onChange={(e) => setPersonalSearch(e.target.value)} placeholder="Buscar por DNI o nombre" />
              </div>
              <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead className="sticky top-0 bg-teal-700 text-white">
                    <tr className="text-xs">
                      <th className="px-3 py-3 text-left font-semibold">Documento</th>
                      <th className="px-3 py-3 text-left font-semibold">Nombres completos</th>
                      <th className="px-3 py-3 text-center font-semibold">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalLoading ? (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">Cargando trabajadores...</td></tr>
                    ) : modalPersonales.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">No se encontraron trabajadores.</td></tr>
                    ) : (
                      modalPersonales.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.numero_documento}</td>
                          <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{item.nombres_completos}</td>
                          <td className="border-t border-slate-200 px-3 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleSelectPersonal(item)}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
                            >
                              Seleccionar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Pagina {modalPage} de {modalTotalPages}</span>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => setModalPage((prev) => Math.max(1, prev - 1))} disabled={!modalCanPrev || modalLoading}>
                    Anterior
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setModalPage((prev) => prev + 1)} disabled={!modalCanNext || modalLoading}>
                    Siguiente
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClearPersonal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Limpiar
                </button>
                <button type="button" onClick={() => setIsPersonalModalOpen(false)} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
