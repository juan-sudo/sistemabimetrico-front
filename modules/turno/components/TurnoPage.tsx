"use client"

import { Clock3, Download, Eye, FileUp, Pencil, PlusCircle, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TurnoPageSkeleton } from "./TurnoPageSkeleton"
import { useTurnoPage } from "../hooks/useTurnoPage"
import type { Turno } from "../interfaces/turno.interface"
import { tipoLabel } from "../utils/turno.utils"

export default function TurnoPage() {
  const {
    token,
    search,
    setSearch,
    tipoFilter,
    setTipoFilter,
    estadoFilter,
    setEstadoFilter,
    page,
    setPage,
    totalItems,
    totalPages,
    canPrev,
    canNext,
    open,
    setOpen,
    detail,
    setDetail,
    loading,
    initialLoading,
    isFetching,
    saving,
    editingId,
    form,
    setForm,
    filteredRows,
    resetForm,
    onSubmit,
    onEdit,
    onDelete,
    onExport,
  } = useTurnoPage()

  if (!token) return <section className="p-6 text-sm text-slate-600">Inicia sesion para continuar.</section>

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2 rounded-2xl border border-white/50 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
              <button className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50">
                <FileUp size={16} />
                Importacion
              </button>
              <button onClick={onExport} className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50">
                <Download size={16} />
                Reporte
              </button>
              <Dialog
                open={open}
                onOpenChange={(next) => {
                  setOpen(next)
                  if (!next) resetForm()
                }}
              >
                <DialogTrigger asChild>
                  <button
                    onClick={() => {
                      resetForm()
                      setOpen(true)
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-emerald-700"
                  >
                    <PlusCircle size={16} />
                    Nuevo
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Editar turno" : "Nuevo turno"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={onSubmit} className="grid gap-3">
                    <Input placeholder="Codigo de turno" required value={form.codigo} onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value }))} />
                    <Input placeholder="Nombre de turno" required value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} />
                    <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-700" value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as Turno["tipo"] }))}>
                      <option value="GENERAL">General</option>
                      <option value="GENERAL_PERSONALIZADO">General Personalizado</option>
                      <option value="DESCANSO">Descanso</option>
                    </select>

                    {form.tipo !== "DESCANSO" && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <Input type="time" value={form.entrada1} onChange={(e) => setForm((p) => ({ ...p, entrada1: e.target.value }))} />
                          <Input type="time" value={form.salida1} onChange={(e) => setForm((p) => ({ ...p, salida1: e.target.value }))} />
                        </div>
                        {form.tipo === "GENERAL_PERSONALIZADO" && (
                          <div className="grid grid-cols-2 gap-3">
                            <Input type="time" value={form.entrada2} onChange={(e) => setForm((p) => ({ ...p, entrada2: e.target.value }))} />
                            <Input type="time" value={form.salida2} onChange={(e) => setForm((p) => ({ ...p, salida2: e.target.value }))} />
                          </div>
                        )}
                      </>
                    )}
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={form.activo} onChange={(e) => setForm((p) => ({ ...p, activo: e.target.checked }))} />
                      Activo
                    </label>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                      <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por codigo o nombre" className="pl-9" />
          </div>
          <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-700" value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}>
            <option value="">Todos los tipos</option>
            <option value="GENERAL">General</option>
            <option value="GENERAL_PERSONALIZADO">General Personalizado</option>
            <option value="DESCANSO">Descanso</option>
          </select>
          <select className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-700" value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activos</option>
            <option value="INACTIVO">Inactivos</option>
          </select>
        </div>

        <p className="px-1 text-sm font-semibold text-slate-600">
          {isFetching ? "Actualizando..." : `Registros: ${totalItems}`}
        </p>

        {initialLoading ? (
          <TurnoPageSkeleton />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="max-h-[520px] overflow-auto">
              <table className="w-full min-w-[1240px]">
                <thead className="sticky top-0 z-10 bg-teal-700 text-white">
                  <tr className="text-sm">
                    <th className="w-28 px-4 py-3 text-left font-semibold">Codigo</th>
                    <th className="w-80 px-4 py-3 text-left font-semibold">Nombre</th>
                    <th className="w-56 px-4 py-3 text-left font-semibold">Tipo</th>
                    <th className="w-44 px-4 py-3 text-left font-semibold">Horario</th>
                    <th className="w-28 px-4 py-3 text-left font-semibold">Estado</th>
                    <th className="w-24 px-4 py-3 text-center font-semibold">Detalle</th>
                    <th className="w-24 px-4 py-3 text-center font-semibold">Editar</th>
                    <th className="w-24 px-4 py-3 text-center font-semibold">Eliminar</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                        Cargando turnos...
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                        No hay registros.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.codigo}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.nombre}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{tipoLabel[item.tipo]}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.horario || item.entrada || "00:00"}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.activo ? "Activo" : "Inactivo"}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-center">
                          <button onClick={() => setDetail(item)} className="inline-flex rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100" aria-label="Detalle turno">
                            <Eye size={16} />
                          </button>
                        </td>
                        <td className="border-t border-slate-200 px-4 py-3 text-center">
                          <button onClick={() => onEdit(item)} className="inline-flex rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-600 transition hover:bg-amber-100" aria-label="Editar turno">
                            <Pencil size={16} />
                          </button>
                        </td>
                        <td className="border-t border-slate-200 px-4 py-3 text-center">
                          <button onClick={() => onDelete(item)} className="inline-flex rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100" aria-label="Eliminar turno">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-600">
                Pagina {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={!canPrev || loading}>
                  Anterior
                </Button>
                <Button type="button" variant="outline" onClick={() => setPage((prev) => prev + 1)} disabled={!canNext || loading}>
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        )}

        <Dialog open={!!detail} onOpenChange={(x) => !x && setDetail(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>Detalle de turno</DialogTitle></DialogHeader>
            {detail && (
              <div className="grid gap-3 text-sm">
                <div><b>Codigo:</b> {detail.codigo}</div>
                <div><b>Nombre:</b> {detail.nombre}</div>
                <div><b>Tipo:</b> {tipoLabel[detail.tipo]}</div>
                <div><b>Etiqueta:</b> {detail.descripcion_larga || `${detail.codigo} - ${detail.nombre}`}</div>
                <div><b>Horario:</b> {detail.horario || "-"}</div>
                <div><b>Entradas:</b> {detail.entrada || "-"}</div>
                <div><b>Salidas:</b> {detail.salida || "-"}</div>
                <div><b>Estado:</b> {detail.activo ? "Activo" : "Inactivo"}</div>
              </div>
            )}
            <DialogFooter><Button onClick={() => setDetail(null)}>Cerrar</Button></DialogFooter>
          </DialogContent>
        </Dialog>

    </>
  )
}
