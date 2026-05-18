"use client"

import { Download, Eye, FileSpreadsheet, FileText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Justificacion } from "../interfaces/justificacion.interface"
import { useJustificacionPage } from "../hooks/useJustificacionPage"

export default function JustificacionPage() {
  const {
    token,
    loading,
    isFetching,
    saving,
    openCrear,
    setOpenCrear,
    busquedaGeneral,
    setBusquedaGeneral,
    filtroMotivo,
    setFiltroMotivo,
    filtroFecha,
    setFiltroFecha,
    sucursalId,
    setSucursalId,
    areaId,
    setAreaId,
    busquedaEmpleado,
    setBusquedaEmpleado,
    selectedPersonalId,
    setSelectedPersonalId,
    form,
    setForm,
    sucursales,
    detailRow,
    setDetailRow,
    sucursalMap,
    areaMap,
    personalMap,
    areasFiltradas,
    empleadosFiltrados,
    justificacionesFiltradas,
    descargarExcel,
    descargarPdf,
    guardar,
  } = useJustificacionPage()

  if (!token) return <section className="p-6 text-sm text-slate-600">Inicia sesion para continuar.</section>

  return (
    <>
      <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-white/50 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
              <Button type="button" variant="outline" className="border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50" onClick={descargarPdf}>
                <FileText size={16} className="mr-2" />
                Descargar PDF
              </Button>
              <Button type="button" variant="outline" className="border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50" onClick={descargarExcel}>
                <FileSpreadsheet size={16} className="mr-2" />
                Descargar Excel
              </Button>
              <Dialog open={openCrear} onOpenChange={setOpenCrear}>
                <DialogTrigger asChild>
                  <Button type="button" className="bg-emerald-600 text-white hover:bg-emerald-700">
                    <Download size={16} className="mr-2" />
                    Crear justificacion
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[88vh] w-[95vw] max-w-2xl overflow-y-auto p-4 sm:w-[92vw] sm:max-w-5xl sm:p-6 xl:max-w-6xl">
                  <DialogHeader><DialogTitle>Crear justificacion por empleado</DialogTitle></DialogHeader>
                  <div className="grid gap-4 xl:grid-cols-[minmax(640px,1fr)_minmax(360px,440px)] xl:items-start">
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">Personal</div>
                      <div className="border-b border-slate-200 p-2"><Input value={busquedaEmpleado} onChange={(e) => setBusquedaEmpleado(e.target.value)} placeholder="Filtrar empleado por nombre o DNI" /></div>
                      <div className="h-[420px] overflow-y-scroll overflow-x-auto">
                        <table className="w-full min-w-[500px]">
                          <thead className="sticky top-0 z-10 bg-teal-700 text-white"><tr className="text-xs"><th className="w-10 px-2 py-2 text-center">#</th><th className="w-28 px-3 py-2 text-left">Documento</th><th className="min-w-[190px] px-3 py-2 text-left">Nombres Completos</th><th className="w-12 px-2 py-2 text-center">Ver</th></tr></thead>
                          <tbody>
                            {empleadosFiltrados.map((row, index) => (
                              <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                <td className="border-t border-slate-200 px-2 py-2 text-center"><input type="radio" name="personal-modal" checked={selectedPersonalId === row.id} onChange={() => setSelectedPersonalId(row.id)} /></td>
                                <td className="border-t border-slate-200 px-3 py-3 text-xs text-slate-700">{row.numero_documento}</td>
                                <td className="border-t border-slate-200 px-3 py-3 text-xs leading-5 text-slate-700">{row.nombres_completos}</td>
                                <td className="border-t border-slate-200 px-2 py-2 text-center"><button type="button" className="inline-flex rounded-md border border-blue-200 bg-blue-50 p-1 text-blue-600"><Search size={14} /></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-700">
                        <p className="font-medium">{selectedPersonalId ? personalMap[selectedPersonalId]?.nombres_completos : "Sin personal seleccionado"}</p>
                        <p className="text-xs text-slate-500">Doc: {selectedPersonalId ? personalMap[selectedPersonalId]?.numero_documento : "-"}</p>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Motivo</label><Input value={form.motivo} onChange={(e) => setForm((p) => ({ ...p, motivo: e.target.value }))} placeholder="Comision de servicios" /></div>
                        <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Dias</label><Input value={form.dias} onChange={(e) => setForm((p) => ({ ...p, dias: e.target.value }))} /></div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Tipo</label><select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as Justificacion["tipo"] }))}><option value="SALIDA">Salida</option><option value="INGRESO">Ingreso</option></select></div>
                        <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Rango</label><select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.rango} onChange={(e) => setForm((p) => ({ ...p, rango: e.target.value as Justificacion["rango"] }))}><option value="PARCIAL">Parcial</option><option value="COMPLETO">Completo</option></select></div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Fecha Inicio</label><Input type="date" value={form.fecha_inicio} onChange={(e) => setForm((p) => ({ ...p, fecha_inicio: e.target.value }))} /></div>
                        <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Fecha Fin</label><Input type="date" value={form.fecha_fin} onChange={(e) => setForm((p) => ({ ...p, fecha_fin: e.target.value }))} /></div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Nro Doc.</label><Input value={form.numero_documento} onChange={(e) => setForm((p) => ({ ...p, numero_documento: e.target.value }))} /></div>
                        <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Nombre Doc.</label><Input value={form.nombre_documento} onChange={(e) => setForm((p) => ({ ...p, nombre_documento: e.target.value }))} /></div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Descripcion</label><Input value={form.descripcion} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))} /></div>
                        <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Adjunto</label><select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.tiene_adjunto ? "SI" : "NO"} onChange={(e) => setForm((p) => ({ ...p, tiene_adjunto: e.target.value === "SI" }))}><option value="SI">SI</option><option value="NO">NO</option></select></div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpenCrear(false)}>Cancelar</Button>
                    <Button type="button" onClick={guardar} disabled={!selectedPersonalId || saving}>{saving ? "Guardando..." : "Guardar"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

        <div className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <FilterSelect label="Sucursal" value={sucursalId} options={sucursales.map((x) => ({ label: x.nombre, value: String(x.id) }))} onChange={setSucursalId} />
            </div>
            <div className="min-w-[220px] flex-1">
              <FilterSelect label="Area" value={areaId} options={areasFiltradas.map((x) => ({ label: x.nombre, value: String(x.id) }))} onChange={setAreaId} />
            </div>
            <div className="min-w-[220px] flex-1 space-y-1">
              <label className="text-sm font-medium text-slate-700">Buscar por Fecha</label>
              <Input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Filtrar por</label>
              <Input value={busquedaGeneral} onChange={(e) => setBusquedaGeneral(e.target.value)} placeholder="Buscar por nombres completos o documento" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Buscar por Motivo</label>
              <Input value={filtroMotivo} onChange={(e) => setFiltroMotivo(e.target.value)} placeholder="Comision, permiso..." />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-700">Justificaciones</p>
            <div className="min-w-0 max-w-full overflow-x-auto rounded-xl border border-slate-200">
              <div className="max-h-[250px] overflow-auto">
                <table className="w-full min-w-[920px]">
                  <thead className="sticky top-0 z-[1] bg-teal-700 text-white">
                    <tr className="text-xs"><th className="px-2 py-2 text-left">Nombres Completos</th><th className="px-2 py-2 text-left">DNI</th><th className="px-2 py-2 text-left">Motivo</th><th className="px-2 py-2 text-left">Tipo</th><th className="px-2 py-2 text-left">Fecha Inicio</th><th className="px-2 py-2 text-left">Fecha Fin</th><th className="px-2 py-2 text-left">Dias</th><th className="px-2 py-2 text-left">Nombre Doc.</th><th className="px-2 py-2 text-center">Detalle</th></tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={9} className="border-t border-slate-200 px-3 py-4 text-center text-sm text-slate-500">Cargando...</td></tr>
                    ) : justificacionesFiltradas.map((row, index) => {
                      const p = personalMap[row.personal]
                      return (
                        <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.personal_nombres_completos || p?.nombres_completos || "-"}</td>
                          <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.personal_numero_documento || p?.numero_documento || "-"}</td>
                          <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.motivo}</td>
                          <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.tipo === "SALIDA" ? "Salida" : "Ingreso"}</td>
                          <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.fecha_inicio}</td>
                          <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.fecha_fin}</td>
                          <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.dias}</td>
                          <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.nombre_documento || "-"}</td>
                          <td className="border-t border-slate-200 px-2 py-2 text-center"><button type="button" onClick={() => setDetailRow(row)} className="inline-flex rounded-md border border-blue-200 bg-blue-50 p-1.5 text-blue-600 transition hover:bg-blue-100"><Eye size={14} /></button></td>
                        </tr>
                      )
                    })}
                    {!loading && justificacionesFiltradas.length === 0 && (
                      <tr><td colSpan={9} className="border-t border-slate-200 px-3 py-4 text-center text-sm text-slate-500">No se encontro registros</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-slate-500">{isFetching ? "Actualizando resultados..." : `Registros: ${justificacionesFiltradas.length}`}</p>
          </div>
        </div>
      </div>

      <Dialog open={!!detailRow} onOpenChange={(next) => !next && setDetailRow(null)}>
        <DialogContent className="max-w-5xl overflow-hidden bg-white p-0">
          <DialogHeader><DialogTitle className="px-6 pt-6 text-xl font-semibold text-slate-800">Detalle de Justificacion</DialogTitle></DialogHeader>
          {detailRow && (
            <div className="space-y-5 px-6 pb-4">
              <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 p-5 text-white shadow-lg">
                <p className="text-lg font-semibold tracking-tight">{detailRow.personal_nombres_completos || personalMap[detailRow.personal]?.nombres_completos || "Sin nombre"}</p>
                <p className="text-sm text-slate-200">DNI: {detailRow.personal_numero_documento || personalMap[detailRow.personal]?.numero_documento || "-"}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <DetailItem label="Sucursal" value={detailRow.sucursal_nombre || sucursalMap[detailRow.sucursal] || "-"} />
                <DetailItem label="Area" value={detailRow.area_nombre || areaMap[detailRow.area] || "-"} />
                <DetailItem label="Motivo" value={detailRow.motivo} />
                <DetailItem label="Tipo" value={detailRow.tipo} />
                <DetailItem label="Rango" value={detailRow.rango} />
                <DetailItem label="Fecha Inicio" value={detailRow.fecha_inicio} />
                <DetailItem label="Fecha Fin" value={detailRow.fecha_fin} />
                <DetailItem label="Dias" value={String(detailRow.dias)} />
                <DetailItem label="Estado" value={detailRow.estado} />
                <DetailItem label="Nombre Documento" value={detailRow.nombre_documento || "-"} />
                <div className="md:col-span-3"><DetailItem label="Descripcion / Observacion" value={detailRow.motivo_no_autorizacion || detailRow.descripcion || "-"} /></div>
              </div>
            </div>
          )}
          <DialogFooter><Button type="button" className="mb-5 mr-6 bg-slate-900 hover:bg-slate-800" onClick={() => setDetailRow(null)}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: { label: string; value: string }[]; onChange: (value: string) => void }) {
  return (
    <div className="w-full space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm md:h-9" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value || "-"}</p>
    </div>
  )
}
