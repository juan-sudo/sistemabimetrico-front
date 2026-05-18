"use client"

import { Download, Eye, FileSpreadsheet, FileText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useDescansoMedicoPage } from "../hooks/useDescansoMedicoPage"
import { buildPersonalProfileFromDescanso } from "../utils/descanso-medico.utils"

export default function DescansoMedicoPage() {
  const {
    token,
    loading,
    isFetching,
    saving,
    openCrearDescanso,
    setOpenCrearDescanso,
    perfilEmpleado,
    setPerfilEmpleado,
    selectedPersonalId,
    setSelectedPersonalId,
    busquedaPersonal,
    setBusquedaPersonal,
    busquedaEmpleadoModal,
    setBusquedaEmpleadoModal,
    filtroMotivo,
    setFiltroMotivo,
    filtroFecha,
    setFiltroFecha,
    sucursalId,
    setSucursalId,
    areaId,
    setAreaId,
    form,
    setForm,
    selectedPersonal,
    personalesModal,
    sucursales,
    areas,
    descansos,
    sucursalMap,
    areaMap,
    areasFiltradas,
    descargarExcel,
    descargarPdf,
    guardar,
  } = useDescansoMedicoPage()

  if (!token) return <section className="p-6 text-sm text-slate-600">Inicia sesion para continuar.</section>

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2 rounded-2xl border border-white/50 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
        <Button type="button" variant="outline" className="border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50" onClick={descargarPdf}>
          <FileText size={16} className="mr-2" />
          Descargar PDF
        </Button>
        <Button type="button" variant="outline" className="border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50" onClick={descargarExcel}>
          <FileSpreadsheet size={16} className="mr-2" />
          Descargar Excel
        </Button>
        <Dialog open={openCrearDescanso} onOpenChange={setOpenCrearDescanso}>
          <DialogTrigger asChild>
            <Button type="button" className="bg-emerald-600 hover:bg-emerald-700">
              <Download size={16} className="mr-2" />
              Crear descanso medico
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[96vw] max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Crear descanso medico por empleado</DialogTitle></DialogHeader>
            <div className="grid gap-4 lg:grid-cols-[620px_420px] lg:justify-between">
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">Personal</div>
                <div className="border-b border-slate-200 p-2"><Input value={busquedaEmpleadoModal} onChange={(e) => setBusquedaEmpleadoModal(e.target.value)} placeholder="Filtrar empleado por nombre o DNI" /></div>
                <div className="h-[420px] overflow-y-scroll overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead className="sticky top-0 z-10 bg-teal-700 text-white"><tr className="text-xs"><th className="w-10 px-2 py-2 text-center">#</th><th className="w-28 px-3 py-2 text-left">Codigo</th><th className="w-28 px-3 py-2 text-left">Documento</th><th className="min-w-[190px] px-3 py-2 text-left">Nombres Completos</th><th className="w-12 px-2 py-2 text-center">Ver</th></tr></thead>
                    <tbody>
                      {personalesModal.map((row, i) => (
                        <tr key={row.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="border-t border-slate-200 px-2 py-2 text-center"><input type="radio" name="personal-modal" checked={selectedPersonalId === row.id} onChange={() => setSelectedPersonalId(row.id)} /></td>
                          <td className="border-t border-slate-200 px-3 py-3 text-xs text-slate-700">{row.codigo_empleado}</td>
                          <td className="border-t border-slate-200 px-3 py-3 text-xs text-slate-700">{row.numero_documento}</td>
                          <td className="border-t border-slate-200 px-3 py-3 text-xs leading-5 text-slate-700">{row.nombres_completos}</td>
                          <td className="border-t border-slate-200 px-2 py-2 text-center"><button type="button" onClick={() => setPerfilEmpleado(row)} className="inline-flex rounded-md border border-blue-200 bg-blue-50 p-1 text-blue-600"><Search size={14} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-700"><p className="font-medium">{selectedPersonal ? selectedPersonal.nombres_completos : "Sin personal seleccionado"}</p><p className="text-xs text-slate-500">Doc: {selectedPersonal ? selectedPersonal.numero_documento : "-"}</p></div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Motivo</label><select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.motivo} onChange={(e) => setForm((p) => ({ ...p, motivo: e.target.value as "SALUD" | "SUBSIDIO" | "" }))}><option value="">---</option><option value="SALUD">Por salud</option><option value="SUBSIDIO">Subsidio</option></select></div>
                  <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Dias</label><Input value={form.dias} onChange={(e) => setForm((p) => ({ ...p, dias: e.target.value }))} /></div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Fecha Inicio</label><Input type="date" value={form.fecha_inicio} onChange={(e) => setForm((p) => ({ ...p, fecha_inicio: e.target.value }))} /></div>
                  <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Fecha Fin</label><Input type="date" value={form.fecha_fin} onChange={(e) => setForm((p) => ({ ...p, fecha_fin: e.target.value }))} /></div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1"><label className="text-sm font-medium text-slate-700">CITT</label><Input value={form.citt} onChange={(e) => setForm((p) => ({ ...p, citt: e.target.value }))} /></div>
                  <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Nro Doc.</label><Input value={form.numero_documento} onChange={(e) => setForm((p) => ({ ...p, numero_documento: e.target.value }))} /></div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Diagnostico</label><Input value={form.diagnostico} onChange={(e) => setForm((p) => ({ ...p, diagnostico: e.target.value }))} /></div>
                  <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Adjunto</label><select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.tiene_adjunto ? "SI" : "NO"} onChange={(e) => setForm((p) => ({ ...p, tiene_adjunto: e.target.value === "SI" }))}><option value="SI">SI</option><option value="NO">NO</option></select></div>
                </div>
              </div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setOpenCrearDescanso(false)}>Cancelar</Button><Button type="button" onClick={guardar} disabled={!selectedPersonalId || saving}>{saving ? "Guardando..." : "Guardar"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <FilterSelect label="Sucursal" value={sucursalId} options={[{ label: "Todos", value: "" }, ...sucursales.map((x) => ({ label: x.nombre, value: String(x.id) }))]} onChange={setSucursalId} />
          <FilterSelect label="Area" value={areaId} options={[{ label: "Todos", value: "" }, ...areasFiltradas.map((x) => ({ label: x.nombre, value: String(x.id) }))]} onChange={setAreaId} />
          <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Filtrar por</label><Input value={busquedaPersonal} onChange={(e) => setBusquedaPersonal(e.target.value)} placeholder="Buscar por nombres completos, numero de documento o codigo" /></div>
          <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Buscar por Motivo</label><select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={filtroMotivo} onChange={(e) => setFiltroMotivo(e.target.value)}><option value="">---</option><option value="SALUD">Por salud</option><option value="SUBSIDIO">Subsidio</option></select></div>
          <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Buscar por Fechas</label><Input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} /></div>
        </div>
        <div className="space-y-3 rounded-xl border border-slate-200 p-3">
          <p className="text-sm font-semibold text-slate-700">Descansos medicos</p>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="max-h-[250px] overflow-auto">
              <table className="w-full min-w-[900px]">
                <thead className="sticky top-0 z-10 bg-teal-700 text-white"><tr className="text-xs"><th className="px-2 py-2 text-left">Nombres Completos</th><th className="px-2 py-2 text-left">DNI</th><th className="px-2 py-2 text-left">Motivo</th><th className="px-2 py-2 text-left">Fecha Inicio</th><th className="px-2 py-2 text-left">Fecha Fin</th><th className="px-2 py-2 text-left">Dias</th><th className="px-2 py-2 text-left">CITT</th><th className="px-2 py-2 text-left">Diagnostico</th><th className="px-2 py-2 text-left">Adjunto</th><th className="px-2 py-2 text-left">Nro Doc.</th><th className="w-20 px-2 py-2 text-center">Detalle</th></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={11} className="border-t border-slate-200 px-3 py-4 text-center text-sm text-slate-500">Cargando...</td></tr>
                  ) : descansos.map((row, i) => (
                    <tr key={row.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.personal_nombres_completos || "-"}</td>
                      <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.personal_numero_documento || "-"}</td>
                      <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.motivo === "SALUD" ? "Por salud" : "Subsidio"}</td>
                      <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.fecha_inicio}</td>
                      <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.fecha_fin}</td>
                      <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.dias}</td>
                      <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.citt || "-"}</td>
                      <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.diagnostico || "-"}</td>
                      <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.tiene_adjunto ? "SI" : "NO"}</td>
                      <td className="border-t border-slate-200 px-2 py-2 text-xs text-slate-700">{row.numero_documento || "-"}</td>
                      <td className="border-t border-slate-200 px-2 py-2 text-center"><button type="button" onClick={() => setPerfilEmpleado(buildPersonalProfileFromDescanso(row))} className="inline-flex rounded-md border border-blue-200 bg-blue-50 p-1.5 text-blue-600 transition hover:bg-blue-100"><Eye size={14} /></button></td>
                    </tr>
                  ))}
                  {!loading && descansos.length === 0 && <tr><td colSpan={11} className="border-t border-slate-200 px-3 py-4 text-center text-sm text-slate-500">No se encontro registros</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-slate-500">{isFetching ? "Actualizando resultados..." : `Registros: ${descansos.length}`}</p>
        </div>
      </div>

      <Dialog open={!!perfilEmpleado} onOpenChange={(next) => !next && setPerfilEmpleado(null)}>
        <DialogContent className="w-[92vw] max-w-4xl border-slate-200 bg-gradient-to-b from-white to-slate-50/70">
          <DialogHeader><DialogTitle className="text-xl text-slate-800">Resumen del perfil del personal</DialogTitle></DialogHeader>
          {perfilEmpleado && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 text-lg font-bold text-white shadow-sm">{getInitials(perfilEmpleado.nombres_completos)}</div>
                    <div><p className="text-xl font-semibold tracking-tight text-slate-800">{perfilEmpleado.nombres_completos}</p><p className="text-sm text-slate-600">DNI: {perfilEmpleado.numero_documento}</p></div>
                  </div>
                  <span className={perfilEmpleado.estado === "ACTIVO" ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700" : "rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700"}>{perfilEmpleado.estado === "ACTIVO" ? "Activo" : "Inactivo"}</span>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <ProfileItem label="Codigo Empleado" value={perfilEmpleado.codigo_empleado} />
                <ProfileItem label="Area" value={areaMap[perfilEmpleado.area] || "-"} />
                <ProfileItem label="Sucursal" value={sucursalMap[perfilEmpleado.sucursal] || "-"} />
                <ProfileItem label="Correo" value={perfilEmpleado.correo || "-"} />
                <ProfileItem label="Telefono" value={perfilEmpleado.telefono || "-"} />
                <ProfileItem label="Fecha de Ingreso" value={perfilEmpleado.fecha_ingreso || "-"} />
              </div>
            </div>
          )}
          <DialogFooter><Button type="button" className="bg-slate-900 hover:bg-slate-800" onClick={() => setPerfilEmpleado(null)}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: { label: string; value: string }[]; onChange: (value: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={`${label}-${o.value || "all"}`} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-700">{value || "-"}</p>
    </div>
  )
}

function getInitials(nombre: string) {
  const parts = nombre.split(" ").filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const second = parts[1]?.[0] ?? ""
  return `${first}${second}`.toUpperCase()
}
