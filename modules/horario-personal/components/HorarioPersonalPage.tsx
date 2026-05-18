"use client"

import { CalendarClock, Pencil, PlusCircle, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HorarioPersonalPageSkeleton } from "./HorarioPersonalPageSkeleton"
import { useHorarioPersonalPage } from "../hooks/useHorarioPersonalPage"

export default function HorarioPersonalPage() {
  const {
    token,
    loading,
    saving,
    open,
    setOpen,
    search,
    setSearch,
    page,
    setPage,
    totalItems,
    totalPages,
    canPrev,
    canNext,
    initialLoading,
    isFetching,
    editingId,
    personales,
    turnos,
    filteredRows,
    selectedTurnoBlocks,
    form,
    setForm,
    resetForm,
    onSubmit,
    onEdit,
    onDelete,
  } = useHorarioPersonalPage()

  if (!token) return <section className="p-6 text-sm text-slate-600">Inicia sesion para continuar.</section>

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2 rounded-2xl border border-white/50 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
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
                  Nuevo horario
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Editar horario" : "Nuevo horario por personal"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid gap-3">
                  <select
                    className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-700"
                    value={form.personal}
                    onChange={(e) => setForm((prev) => ({ ...prev, personal: e.target.value }))}
                    required
                  >
                    <option value="">Selecciona personal</option>
                    {personales.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.numero_documento} - {item.nombres_completos}
                      </option>
                    ))}
                  </select>

                  <select
                    className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-700"
                    value={form.turno}
                    onChange={(e) => setForm((prev) => ({ ...prev, turno: e.target.value }))}
                    required
                  >
                    <option value="">Selecciona turno</option>
                    {turnos.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.codigo} - {item.nombre}
                      </option>
                    ))}
                  </select>

                  <Input type="date" value={form.fechaInicio} onChange={(e) => setForm((prev) => ({ ...prev, fechaInicio: e.target.value }))} required />

                  {editingId && <Input type="date" value={form.fechaFin} onChange={(e) => setForm((prev) => ({ ...prev, fechaFin: e.target.value }))} />}

                  <Input placeholder="Observacion" value={form.observacion} onChange={(e) => setForm((prev) => ({ ...prev, observacion: e.target.value }))} />

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Horario del turno seleccionado</p>
                    {selectedTurnoBlocks.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-600">Selecciona un turno para ver sus horas de entrada y salida.</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {selectedTurnoBlocks.map((block) => (
                          <div key={block.id} className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-700">
                            <span>Bloque {block.orden}</span>
                            <span className="font-semibold">{block.hora_entrada.slice(0, 5)} - {block.hora_salida.slice(0, 5)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Buscar asignacion</label>
          <div className="relative md:max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por documento, nombre, area o turno" className="pl-9" />
          </div>
        </div>

        {initialLoading ? (
          <HorarioPersonalPageSkeleton />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full min-w-[1280px]">
                <thead className="sticky top-0 z-10 bg-teal-700 text-white">
                  <tr className="text-sm">
                    <th className="px-4 py-3 text-left font-semibold">Sucursal</th>
                    <th className="px-4 py-3 text-left font-semibold">Area</th>
                    <th className="px-4 py-3 text-left font-semibold">Numero de documento</th>
                    <th className="px-4 py-3 text-left font-semibold">Nombres completos</th>
                    <th className="px-4 py-3 text-left font-semibold">Turno</th>
                    <th className="px-4 py-3 text-left font-semibold">Horario</th>
                    <th className="px-4 py-3 text-left font-semibold">Fecha inicio</th>
                    <th className="px-4 py-3 text-left font-semibold">Fecha fin</th>
                    <th className="px-4 py-3 text-left font-semibold">Horario entrada</th>
                    <th className="px-4 py-3 text-left font-semibold">Horario salida</th>
                    <th className="px-4 py-3 text-center font-semibold">Editar</th>
                    <th className="px-4 py-3 text-center font-semibold">Eliminar</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500">Cargando horarios por personal...</td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500">No hay horarios registrados.</td>
                    </tr>
                  ) : (
                    filteredRows.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.sucursalNombre}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.areaNombre}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.personalDoc}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.personalNombre}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.turnoNombre}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.horario}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.fecha_inicio}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{item.fecha_fin || "-"}</td>
                        <td className="border-t border-slate-200 px-4 py-3 font-medium text-blue-700">{item.horaEntrada}</td>
                        <td className="border-t border-slate-200 px-4 py-3 font-medium text-blue-700">{item.horaSalida}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-center">
                          <button onClick={() => onEdit(item)} className="inline-flex rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-600 transition hover:bg-amber-100" aria-label="Editar horario">
                            <Pencil size={16} />
                          </button>
                        </td>
                        <td className="border-t border-slate-200 px-4 py-3 text-center">
                          <button onClick={() => onDelete(item)} className="inline-flex rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100" aria-label="Eliminar horario">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="px-1 text-sm font-semibold text-slate-600">{isFetching ? "Actualizando..." : `Registros: ${totalItems}`}</p>
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
    </>
  )
}
