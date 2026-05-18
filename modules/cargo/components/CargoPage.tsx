"use client"

import { BriefcaseBusiness, Download, Pencil, PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CargoPageSkeleton } from "./CargoPageSkeleton"
import { useCargoPage } from "../hooks/useCargoPage"

export default function CargoPage() {
  const {
    token,
    search,
    setSearch,
    page,
    setPage,
    totalItems,
    totalPages,
    canPrev,
    canNext,
    open,
    loading,
    initialLoading,
    isFetching,
    saving,
    editingId,
    form,
    setForm,
    filteredRows,
    onSubmit,
    onEdit,
    onDelete,
    onOpenChange,
    openCreateModal,
  } = useCargoPage()

  if (!token) return <section className="p-6 text-sm text-slate-600">Inicia sesion para continuar.</section>

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2 rounded-2xl border border-white/50 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
              <button className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50">
                <Download size={16} />
                Reporte
              </button>
              <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogTrigger asChild>
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-emerald-700"
                  >
                    <PlusCircle size={16} />
                    Nuevo Cargo
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Editar Cargo" : "Nuevo Cargo"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={onSubmit} className="grid gap-3">
                    <Input placeholder="Codigo" required value={form.codigo} onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value }))} />
                    <Input placeholder="Descripcion" required value={form.descripcion} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))} />
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={form.activo} onChange={(e) => setForm((p) => ({ ...p, activo: e.target.checked }))} />
                      Activo
                    </label>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                      <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Buscar Cargo</label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ingrese nombre de cargo"
            className="md:max-w-md"
          />
        </div>

        <p className="px-1 text-sm font-semibold text-slate-600">
          {isFetching ? "Actualizando..." : `Registros: ${totalItems}`}
        </p>

        {initialLoading ? (
          <CargoPageSkeleton />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="max-h-[520px] overflow-auto">
              <table className="w-full min-w-[740px]">
                <thead className="sticky top-0 z-10 bg-teal-700 text-white">
                  <tr className="text-sm">
                    <th className="w-24 px-4 py-3 text-left font-semibold">Codigo</th>
                    <th className="px-4 py-3 text-left font-semibold">Descripcion</th>
                    <th className="w-24 px-4 py-3 text-center font-semibold">Editar</th>
                    <th className="w-24 px-4 py-3 text-center font-semibold">Eliminar</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                        Cargando cargos...
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                        No hay registros.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((cargo, index) => (
                      <tr key={cargo.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{cargo.codigo}</td>
                        <td className="border-t border-slate-200 px-4 py-3 font-medium text-slate-700">{cargo.descripcion}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-center">
                          <button onClick={() => onEdit(cargo)} className="inline-flex rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-600 transition hover:bg-amber-100" aria-label="Editar cargo">
                            <Pencil size={16} />
                          </button>
                        </td>
                        <td className="border-t border-slate-200 px-4 py-3 text-center">
                          <button onClick={() => onDelete(cargo)} className="inline-flex rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100" aria-label="Eliminar cargo">
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
    </>
  )
}
