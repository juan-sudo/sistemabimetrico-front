"use client"

import { Download, Pencil, PlusCircle, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EmpresaPageSkeleton } from "./EmpresaPageSkeleton"
import { useEmpresaPage } from "../hooks/useEmpresaPage"
import type { EmpresaListResponse } from "../interfaces/empresa.interface"

export default function EmpresaPage({ initialData = null }: { initialData?: EmpresaListResponse | null }) {
  const {
    token,
    items,
    totalItems,
    loading,
    initialLoading,
    isFetching,
    saving,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    canPrev,
    canNext,
    open,
    setOpen,
    editingId,
    form,
    setForm,
    resetForm,
    onSubmit,
    onEdit,
    onDelete,
  } = useEmpresaPage(initialData)

  if (!token) return <EmpresaPageSkeleton />

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2 rounded-2xl border border-white/50 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
        <button className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50">
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
              Nueva Empresa
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Empresa" : "Nueva Empresa"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="grid gap-3">
              <Input placeholder="Codigo" required value={form.codigo} onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value }))} />
              <Input placeholder="Razon Social" required value={form.razon_social} onChange={(e) => setForm((p) => ({ ...p, razon_social: e.target.value }))} />
              <Input placeholder="RUC" required value={form.ruc} onChange={(e) => setForm((p) => ({ ...p, ruc: e.target.value }))} />
              <Input placeholder="Correo" type="email" value={form.correo} onChange={(e) => setForm((p) => ({ ...p, correo: e.target.value }))} />
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

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por codigo, razon social, RUC o correo"
            className="pl-9"
          />
        </div>
        <div className="flex items-center justify-end text-sm text-slate-600">
          {isFetching ? "Actualizando..." : `Registros: ${totalItems}`}
        </div>
      </div>

      {initialLoading ? (
        <EmpresaPageSkeleton />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="max-h-[520px] overflow-auto">
              <table className="w-full min-w-[980px]">
                <thead className="sticky top-0 z-10 bg-teal-700 text-white">
                  <tr className="text-sm">
                    <th className="w-20 px-4 py-3 text-left font-semibold">Codigo</th>
                    <th className="w-24 px-4 py-3 text-left font-semibold">Logo</th>
                    <th className="px-4 py-3 text-left font-semibold">Razon Social</th>
                    <th className="w-44 px-4 py-3 text-left font-semibold">RUC</th>
                    <th className="w-64 px-4 py-3 text-left font-semibold">Correo</th>
                    <th className="w-24 px-4 py-3 text-center font-semibold">Editar</th>
                    <th className="w-24 px-4 py-3 text-center font-semibold">Eliminar</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500">Cargando empresas...</td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500">No hay registros.</td>
                    </tr>
                  ) : (
                    items.map((empresa, index) => (
                      <tr key={empresa.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{empresa.codigo}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-500">{empresa.logo ? "Cargado" : "-"}</td>
                        <td className="border-t border-slate-200 px-4 py-3 font-medium text-slate-700">{empresa.razon_social}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{empresa.ruc}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-slate-700">{empresa.correo || "-"}</td>
                        <td className="border-t border-slate-200 px-4 py-3 text-center">
                          <button onClick={() => onEdit(empresa)} className="inline-flex rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-600 transition hover:bg-amber-100" aria-label="Editar empresa">
                            <Pencil size={16} />
                          </button>
                        </td>
                        <td className="border-t border-slate-200 px-4 py-3 text-center">
                          <button onClick={() => onDelete(empresa)} className="inline-flex rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100" aria-label="Eliminar empresa">
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

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
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
        </>
      )}
    </>
  )
}
