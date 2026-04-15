"use client"

import { Eye, Pencil, PlusCircle, Search, Trash2, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { FormState } from "../interfaces/personal.interface"
import { usePersonalPage } from "../hooks/usePersonalPage"

export default function PersonalPage() {
  const {
    token,
    search,
    setSearch,
    open,
    setOpen,
    editingId,
    detail,
    setDetail,
    saving,
    loading,
    form,
    setForm,
    empresaFilter,
    setEmpresaFilter,
    sucursalFilter,
    setSucursalFilter,
    areaFilter,
    setAreaFilter,
    estadoFilter,
    setEstadoFilter,
    empresas,
    sucursales,
    areas,
    ubicaciones,
    tiposDoc,
    tiposTrab,
    categorias,
    tiposSind,
    cargos,
    formSucursales,
    formAreas,
    filtered,
    totalItems,
    page,
    setPage,
    totalPages,
    canPrev,
    canNext,
    resetForm,
    onSave,
    edit,
    remove,
  } = usePersonalPage()

  if (!token) return <section className="p-6 text-sm text-slate-600">Inicia sesion para continuar.</section>

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-[radial-gradient(circle_at_top_right,#dcfce7_0%,#f8fafc_45%,#eef2ff_100%)] p-3 md:p-6">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="rounded-2xl border border-white/50 bg-white/80 p-5 shadow-lg backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700"><UsersRound size={22} /></div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-800 md:text-3xl">Mantenimiento de Personal</h1>
                <p className="text-sm text-slate-500">Completa datos laborales, contacto, cargo y ubicacion geografica.</p>
              </div>
            </div>
            <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) resetForm() }}>
              <DialogTrigger asChild>
                <button onClick={() => { resetForm(); setOpen(true) }} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
                  <PlusCircle size={16} /> Nuevo personal
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl">
                <DialogHeader><DialogTitle>{editingId ? "Editar personal" : "Registrar personal"}</DialogTitle></DialogHeader>
                <form className="grid gap-3 md:grid-cols-3" onSubmit={onSave}>
                  <Input required placeholder="Codigo empleado" value={form.codigo_empleado} onChange={(e) => setForm((p) => ({ ...p, codigo_empleado: e.target.value }))} />
                  <Input required placeholder="Numero documento" value={form.numero_documento} onChange={(e) => setForm((p) => ({ ...p, numero_documento: e.target.value }))} />
                  <Input required placeholder="Nombres completos" value={form.nombres_completos} onChange={(e) => setForm((p) => ({ ...p, nombres_completos: e.target.value }))} />
                  <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm" value={form.empresa} onChange={(e) => setForm((p) => ({ ...p, empresa: e.target.value }))}>{empresas.map((x) => <option key={x.id} value={x.id}>{x.razon_social}</option>)}</select>
                  <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm" value={form.sucursal} onChange={(e) => setForm((p) => ({ ...p, sucursal: e.target.value }))}>{formSucursales.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select>
                  <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm" value={form.area} onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}>{formAreas.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select>
                  <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm" value={form.tipo_documento} onChange={(e) => setForm((p) => ({ ...p, tipo_documento: e.target.value }))}><option value="" disabled>Tipo documento</option>{tiposDoc.map((x) => <option key={x.id} value={x.id}>{x.descripcion}</option>)}</select>
                  <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm" value={form.tipo_trabajador} onChange={(e) => setForm((p) => ({ ...p, tipo_trabajador: e.target.value }))}><option value="" disabled>Tipo trabajador</option>{tiposTrab.map((x) => <option key={x.id} value={x.id}>{x.descripcion}</option>)}</select>
                  <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm" value={form.categoria} onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}><option value="" disabled>Categoria</option>{categorias.map((x) => <option key={x.id} value={x.id}>{x.descripcion}</option>)}</select>
                  <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm" value={form.cargo} onChange={(e) => setForm((p) => ({ ...p, cargo: e.target.value }))}><option value="">Sin cargo</option>{cargos.map((x) => <option key={x.id} value={x.id}>{x.descripcion}</option>)}</select>
                  <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm" value={form.ubicacion} onChange={(e) => setForm((p) => ({ ...p, ubicacion: e.target.value }))}><option value="">Sin ubicacion</option>{ubicaciones.map((x) => <option key={x.id} value={x.id}>{x.descripcion || x.nombre}</option>)}</select>
                  <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm" value={form.tipo_sindicato} onChange={(e) => setForm((p) => ({ ...p, tipo_sindicato: e.target.value }))}><option value="">Sin sindicato</option>{tiposSind.map((x) => <option key={x.id} value={x.id}>{x.descripcion}</option>)}</select>
                  <Input type="email" placeholder="Correo" value={form.correo} onChange={(e) => setForm((p) => ({ ...p, correo: e.target.value }))} />
                  <Input placeholder="Telefono" value={form.telefono} onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))} />
                  <Input type="date" value={form.fecha_ingreso} onChange={(e) => setForm((p) => ({ ...p, fecha_ingreso: e.target.value }))} />
                  <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm md:col-span-3" value={form.estado} onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value as FormState["estado"] }))}><option value="ACTIVO">Activo</option><option value="INACTIVO">Inactivo</option></select>
                  <DialogFooter className="md:col-span-3">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por codigo, documento, nombre o contacto" className="pl-9" />
          </div>
          <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm" value={empresaFilter} onChange={(e) => { setEmpresaFilter(e.target.value); setSucursalFilter(""); setAreaFilter("") }}><option value="">Todas las empresas</option>{empresas.map((x) => <option key={x.id} value={x.id}>{x.razon_social}</option>)}</select>
          <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm" value={sucursalFilter} onChange={(e) => { setSucursalFilter(e.target.value); setAreaFilter("") }}><option value="">Todas las sucursales</option>{sucursales.filter((x) => !empresaFilter || String(x.empresa) === empresaFilter).map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select>
          <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm" value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}><option value="">Todas las areas</option>{areas.filter((x) => !sucursalFilter || String(x.sucursal) === sucursalFilter).map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select>
          <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm md:col-start-5" value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}><option value="">Todos los estados</option><option value="ACTIVO">Activos</option><option value="INACTIVO">Inactivos</option></select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="max-h-[600px] overflow-auto">
            <table className="w-full min-w-[1320px]">
              <thead className="sticky top-0 z-10 bg-teal-700 text-white">
                <tr className="text-sm">
                  <th className="px-4 py-3 text-left">Empresa</th><th className="px-4 py-3 text-left">Sucursal</th><th className="px-4 py-3 text-left">Area</th><th className="px-4 py-3 text-left">Codigo</th><th className="px-4 py-3 text-left">Documento</th><th className="px-4 py-3 text-left">Nombres</th><th className="px-4 py-3 text-left">Cargo</th><th className="px-4 py-3 text-left">Contacto</th><th className="px-4 py-3 text-left">Ingreso</th><th className="px-4 py-3 text-left">Estado</th><th className="px-4 py-3 text-center">Detalle</th><th className="px-4 py-3 text-center">Editar</th><th className="px-4 py-3 text-center">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={13} className="px-4 py-8 text-center text-sm text-slate-500">Cargando...</td></tr> : filtered.length === 0 ? <tr><td colSpan={13} className="px-4 py-8 text-center text-sm text-slate-500">No hay registros.</td></tr> : filtered.map((x, i) => (
                  <tr key={x.id} className={i % 2 ? "bg-slate-50" : "bg-white"}>
                    <td className="border-t px-4 py-3">{x.empresa_nombre || "-"}</td>
                    <td className="border-t px-4 py-3">{x.sucursal_nombre || "-"}</td>
                    <td className="border-t px-4 py-3">{x.area_nombre || "-"}</td>
                    <td className="border-t px-4 py-3">{x.codigo_empleado}</td>
                    <td className="border-t px-4 py-3">{x.numero_documento}</td>
                    <td className="border-t px-4 py-3 font-medium">{x.nombres_completos}</td>
                    <td className="border-t px-4 py-3">{x.cargo_nombre || "-"}</td>
                    <td className="border-t px-4 py-3">{[x.correo, x.telefono].filter(Boolean).join(" / ") || "-"}</td>
                    <td className="border-t px-4 py-3">{x.fecha_ingreso || "-"}</td>
                    <td className="border-t px-4 py-3">{x.estado === "ACTIVO" ? "Activo" : "Inactivo"}</td>
                    <td className="border-t px-4 py-3 text-center"><button onClick={() => setDetail(x)} className="rounded border border-blue-200 bg-blue-50 p-2 text-blue-600"><Eye size={16} /></button></td>
                    <td className="border-t px-4 py-3 text-center"><button onClick={() => edit(x)} className="rounded border border-amber-200 bg-amber-50 p-2 text-amber-600"><Pencil size={16} /></button></td>
                    <td className="border-t px-4 py-3 text-center"><button onClick={() => remove(x)} className="rounded border border-rose-200 bg-rose-50 p-2 text-rose-600"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={!!detail} onOpenChange={(x) => !x && setDetail(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Detalle</DialogTitle></DialogHeader>
            {detail && (
              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div><b>Nombre:</b> {detail.nombres_completos}</div>
                  <div><b>Codigo:</b> {detail.codigo_empleado}</div>
                  <div><b>Documento:</b> {detail.tipo_documento_nombre || "Documento"} {detail.numero_documento}</div>
                  <div><b>Estado:</b> {detail.estado === "ACTIVO" ? "Activo" : "Inactivo"}</div>
                  <div><b>Fecha ingreso:</b> {detail.fecha_ingreso || "-"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div><b>Empresa:</b> {detail.empresa_nombre || "-"}</div>
                  <div><b>Sucursal:</b> {detail.sucursal_nombre || "-"}</div>
                  <div><b>Area:</b> {detail.area_nombre || "-"}</div>
                  <div><b>Cargo:</b> {detail.cargo_nombre || "-"}</div>
                  <div><b>Ubicacion:</b> {detail.ubicacion_nombre || "-"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div><b>Tipo trabajador:</b> {detail.tipo_trabajador_nombre || "-"}</div>
                  <div><b>Categoria:</b> {detail.categoria_nombre || "-"}</div>
                  <div><b>Sindicato:</b> {detail.tipo_sindicato_nombre || "-"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div><b>Correo:</b> {detail.correo || "-"}</div>
                  <div><b>Telefono:</b> {detail.telefono || "-"}</div>
                </div>
              </div>
            )}
            <DialogFooter><Button onClick={() => setDetail(null)}>Cerrar</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex items-center justify-between">
          <p className="px-1 text-sm font-semibold text-slate-600">Registros: {totalItems}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Pagina {page} de {totalPages}</span>
            <Button type="button" variant="outline" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={!canPrev || loading}>
              Anterior
            </Button>
            <Button type="button" variant="outline" onClick={() => setPage((prev) => prev + 1)} disabled={!canNext || loading}>
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
