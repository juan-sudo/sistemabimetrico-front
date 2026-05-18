"use client"

import { Eye, FileSpreadsheet, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { FiltroEstado } from "../interfaces/autorizar-justificacion.interface"
import { months } from "../utils/autorizar-justificacion.utils"
import { useAutorizarJustificacionPage } from "../hooks/useAutorizarJustificacionPage"

export default function AutorizarJustificacionPage() {
  const {
    token,
    loading,
    isFetching,
    sucursales,
    selectedIds,
    sucursal,
    setSucursal,
    area,
    setArea,
    mes,
    setMes,
    anio,
    setAnio,
    filtroEstado,
    setFiltroEstado,
    openAutorizarModal,
    setOpenAutorizarModal,
    openNoAutorizarModal,
    setOpenNoAutorizarModal,
    descripcionNoAutorizado,
    setDescripcionNoAutorizado,
    detailRow,
    setDetailRow,
    sucursalMap,
    areaMap,
    areasFiltradas,
    visibleRows,
    selectedRows,
    toggleSelected,
    gestionar,
    exportarExcel,
    exportarPdf,
  } = useAutorizarJustificacionPage()

  if (!token) return <section className="p-6 text-sm text-slate-600">Inicia sesion para continuar.</section>

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2 rounded-2xl border border-white/50 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
        <Button type="button" variant="outline" className="border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50" onClick={exportarPdf}>
          <FileText size={16} className="mr-2" />
          Exportar PDF
        </Button>
        <Button type="button" variant="outline" className="border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50" onClick={exportarExcel}>
          <FileSpreadsheet size={16} className="mr-2" />
          Exportar Excel
        </Button>
      </div>

      <div className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-5">
          <FilterSelect label="Sucursal" value={sucursal} onChange={setSucursal} options={[{ label: "Todos", value: "" }, ...sucursales.map((x) => ({ label: x.nombre, value: String(x.id) }))]} />
          <FilterSelect label="Area" value={area} onChange={setArea} options={[{ label: "Todos", value: "" }, ...areasFiltradas.map((x) => ({ label: x.nombre, value: String(x.id) }))]} />
          <FilterSelect label="Mes" value={mes} onChange={setMes} options={[{ label: "Todos", value: "" }, ...months.filter(Boolean).map((m) => ({ label: m, value: m }))]} />
          <FilterSelect label="Anio" value={anio} onChange={setAnio} options={[String(new Date().getFullYear() - 1), String(new Date().getFullYear()), String(new Date().getFullYear() + 1)].map((x) => ({ label: x, value: x }))} />
          <FilterSelect
            label="Filtro de Estado"
            value={filtroEstado}
            onChange={(value) => setFiltroEstado(value as FiltroEstado)}
            options={[
              { label: "Todos", value: "TODOS" },
              { label: "Autorizado", value: "AUTORIZADO" },
              { label: "No Autorizado", value: "NO_AUTORIZADO" },
            ]}
          />
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-700">
            Seleccionados: <span className="font-semibold text-slate-900">{selectedIds.length}</span>
          </p>
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto">
            <Button type="button" className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto" disabled={selectedIds.length === 0} onClick={() => setOpenAutorizarModal(true)}>Autorizar</Button>
            <Button type="button" className="w-full bg-rose-600 hover:bg-rose-700 sm:w-auto" disabled={selectedIds.length === 0} onClick={() => setOpenNoAutorizarModal(true)}>No Autorizar</Button>
          </div>
        </div>
        <div className="min-w-0 max-w-full overflow-x-auto rounded-xl border border-slate-200">
          <div className="max-h-[430px] overflow-auto">
            <table className="w-full min-w-[760px] lg:min-w-[980px]">
              <thead className="sticky top-0 z-[1] bg-teal-700 text-white"><tr className="text-xs"><th className="w-10 px-2 py-2 text-center">#</th><th className="px-2 py-2 text-left">Sucursal</th><th className="hidden px-2 py-2 text-left md:table-cell">Area</th><th className="px-2 py-2 text-left">Numero de Documento</th><th className="px-2 py-2 text-left">Nombres Completos</th><th className="hidden px-2 py-2 text-left lg:table-cell">Motivo</th><th className="hidden px-2 py-2 text-left lg:table-cell">Dias</th><th className="px-2 py-2 text-left">Estado</th><th className="w-20 px-2 py-2 text-center">Detalle</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="border-t border-slate-200 px-3 py-4 text-center text-sm text-slate-500">Cargando...</td></tr>
                ) : visibleRows.map((row, index) => (
                  <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="border-t border-slate-200 px-2 py-2 text-center"><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelected(row.id)} /></td>
                    <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.sucursal_nombre || sucursalMap[row.sucursal] || "-"}</td>
                    <td className="hidden border-t border-slate-200 px-2 py-2 text-xs text-slate-700 md:table-cell">{row.area_nombre || areaMap[row.area] || "-"}</td>
                    <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.personal_numero_documento || "-"}</td>
                    <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.personal_nombres_completos || "-"}</td>
                    <td className="hidden border-t border-slate-200 px-2 py-2 text-xs text-slate-700 lg:table-cell">{row.motivo}</td>
                    <td className="hidden border-t border-slate-200 px-2 py-2 text-xs text-slate-700 lg:table-cell">{row.dias}</td>
                    <td className="border-t border-slate-200 px-2 py-2 text-xs"><span className={row.estado === "AUTORIZADO" ? "font-semibold text-emerald-700" : row.estado === "NO_AUTORIZADO" ? "font-semibold text-rose-700" : "font-semibold text-amber-700"}>{row.estado}</span></td>
                    <td className="border-t border-slate-200 px-2 py-2 text-center"><button type="button" onClick={() => setDetailRow(row)} className="inline-flex rounded-md border border-blue-200 bg-blue-50 p-1.5 text-blue-600 transition hover:bg-blue-100"><Eye size={14} /></button></td>
                  </tr>
                ))}
                {!loading && visibleRows.length === 0 && <tr><td colSpan={9} className="border-t border-slate-200 px-3 py-4 text-center text-sm text-slate-500">No se encontro registros</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-slate-500">{isFetching ? "Actualizando..." : `Registros: ${visibleRows.length}`}</p>
      </div>

      <Dialog open={openAutorizarModal} onOpenChange={setOpenAutorizarModal}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-xl">
          <DialogHeader><DialogTitle>Confirmar autorizacion</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm text-slate-700"><p>Se va a autorizar al siguiente personal:</p><div className="max-h-48 space-y-1 overflow-auto rounded-lg border bg-slate-50 p-3">{selectedRows.map((r) => <p key={r.id} className="font-medium">{r.personal_nombres_completos || "-"}</p>)}</div></div>
          <DialogFooter className="grid grid-cols-1 gap-2 sm:flex">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setOpenAutorizarModal(false)}>Cancelar</Button>
            <Button type="button" className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto" onClick={() => { gestionar("AUTORIZAR"); setOpenAutorizarModal(false) }}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openNoAutorizarModal} onOpenChange={setOpenNoAutorizarModal}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-xl">
          <DialogHeader><DialogTitle>No autorizar personal</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm text-slate-700"><p>Ingrese la descripcion del motivo por el cual no se autoriza.</p><div className="max-h-32 space-y-1 overflow-auto rounded-lg border bg-slate-50 p-3">{selectedRows.map((r) => <p key={r.id} className="font-medium">{r.personal_nombres_completos || "-"}</p>)}</div><div className="space-y-1"><label className="text-sm font-medium text-slate-700">Descripcion</label><textarea className="min-h-[110px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={descripcionNoAutorizado} onChange={(e) => setDescripcionNoAutorizado(e.target.value)} /></div></div>
          <DialogFooter className="grid grid-cols-1 gap-2 sm:flex">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setOpenNoAutorizarModal(false)}>Cancelar</Button>
            <Button type="button" className="w-full bg-rose-600 hover:bg-rose-700 sm:w-auto" disabled={!descripcionNoAutorizado.trim()} onClick={() => { gestionar("NO_AUTORIZAR", descripcionNoAutorizado.trim()); setDescripcionNoAutorizado(""); setOpenNoAutorizarModal(false) }}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailRow} onOpenChange={(next) => !next && setDetailRow(null)}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-3xl overflow-hidden bg-white p-0">
          <DialogHeader><DialogTitle className="px-4 pt-4 text-lg font-semibold text-slate-800 sm:px-6 sm:pt-6 sm:text-xl">Detalle de Justificacion</DialogTitle></DialogHeader>
          {detailRow && (
            <div className="max-h-[75vh] space-y-3 overflow-y-auto px-3 pb-3 sm:px-4 sm:pb-4">
              <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 p-4 text-white shadow-lg"><p className="text-base font-semibold tracking-tight sm:text-lg">{detailRow.personal_nombres_completos || "-"}</p><p className="text-sm text-slate-200">DNI: {detailRow.personal_numero_documento || "-"}</p></div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <DetailItem label="Sucursal" value={detailRow.sucursal_nombre || sucursalMap[detailRow.sucursal] || "-"} />
                <DetailItem label="Area" value={detailRow.area_nombre || areaMap[detailRow.area] || "-"} />
                <DetailItem label="Motivo" value={detailRow.motivo} />
                <DetailItem label="Tipo" value={detailRow.tipo} />
                <DetailItem label="Rango" value={detailRow.rango} />
                <DetailItem label="Fecha Inicio" value={detailRow.fecha_inicio} />
                <DetailItem label="Fecha Fin" value={detailRow.fecha_fin} />
                <DetailItem label="Dias" value={String(detailRow.dias)} />
                <DetailItem label="Nombre Documento" value={detailRow.nombre_documento || "-"} />
                <DetailItem label="Estado" value={detailRow.estado} />
                <div className="sm:col-span-2 lg:col-span-3"><DetailItem label="Motivo de No Autorizacion / Observacion" value={detailRow.motivo_no_autorizacion || detailRow.descripcion || "-"} /></div>
              </div>
            </div>
          )}
          <DialogFooter className="px-3 pb-3 sm:px-4 sm:pb-4"><Button type="button" className="w-full bg-slate-900 hover:bg-slate-800 sm:ml-auto sm:w-auto" onClick={() => setDetailRow(null)}>Cerrar</Button></DialogFooter>
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
        {options.map((o) => <option key={`${label}-${o.value || "all"}`} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md sm:p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-slate-800 sm:mt-2">{value || "-"}</p>
    </div>
  )
}
