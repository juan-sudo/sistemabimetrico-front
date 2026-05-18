"use client"

import { type FormEvent } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, PlusCircle, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import type { Marcacion } from "../interfaces/marcaciones.interface"
import { useMarcacionesPage } from "../hooks/useMarcacionesPage"
import type { MarcacionesInitialData } from "./page"

interface Props {
  initialData: MarcacionesInitialData | null
  // El token ahora se obtiene del hook, que lo lee desde el store de Zustand.
}

export function MarcacionesClientPage({ initialData }: Props) {
  const {
    token,
    open,
    setOpen,
    loading,
    detailMarcacion,
    setDetailMarcacion,
    marcaciones,
    form,
    setForm,
    onSubmit,
    pagination,
    search,
  } = useMarcacionesPage({ initialData })

  if (!token) return <section className="p-6 text-sm text-slate-600">Inicia sesion para continuar.</section>

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <Input
            value={search.busqueda}
            onChange={(e) => search.setBusqueda(e.target.value)}
            className="pl-10"
            placeholder="Buscar por codigo, nombres..."
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50">
            <Download size={16} />
            Importacion
          </button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-emerald-700">
                <PlusCircle size={16} />
                Nuevo
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar marcacion</DialogTitle>
              </DialogHeader>

              <form className="space-y-4" onSubmit={onSubmit as (e: FormEvent) => void}>
                <div className="grid gap-3 md:grid-cols-3">
                  <FilterSelect label="Empresa" value={form.empresa} onChange={(v) => setForm((prev) => ({ ...prev, empresa: v }))} options={[]} />
                  <FilterSelect label="Sucursal" value={form.sucursal} onChange={(v) => setForm((prev) => ({ ...prev, sucursal: v }))} options={[]} />
                  <FilterSelect label="Area" value={form.area} onChange={(v) => setForm((prev) => ({ ...prev, area: v }))} options={[]} />
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <FilterSelect label="Tipo Documento" value={form.tipoDocumento} onChange={(v) => setForm((prev) => ({ ...prev, tipoDocumento: v }))} options={[]} />
                  <FilterSelect label="Tipo Trabajador" value={form.tipoTrabajador} onChange={(v) => setForm((prev) => ({ ...prev, tipoTrabajador: v }))} options={[]} />
                  <FilterSelect label="Categoria" value={form.categoria} onChange={(v) => setForm((prev) => ({ ...prev, categoria: v }))} options={[]} />
                  <FilterSelect label="Tipo Sindicato" value={form.tipoSindicato} onChange={(v) => setForm((prev) => ({ ...prev, tipoSindicato: v }))} options={[]} />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Filtrar por</label>
                    <Input value={form.filtrarPor} onChange={(e) => setForm((prev) => ({ ...prev, filtrarPor: e.target.value }))} placeholder="Buscar por nombres completos, numero de documento o codigo" />
                  </div>
                  <FilterSelect label="Situacion" value={form.situacion} onChange={(v) => setForm((prev) => ({ ...prev, situacion: v as Marcacion["situacion"] }))} options={["Activo", "Inactivo"]} />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Codigo de Empleado</label>
                    <Input value={form.codigoEmpleado} onChange={(e) => setForm((prev) => ({ ...prev, codigoEmpleado: e.target.value }))} placeholder="70145786" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Numero de Documento</label>
                    <Input value={form.numeroDocumento} onChange={(e) => setForm((prev) => ({ ...prev, numeroDocumento: e.target.value }))} placeholder="70145786" required />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Codigo de Equipo</label>
                    <Input value={form.codigoEquipo} onChange={(e) => setForm((prev) => ({ ...prev, codigoEquipo: e.target.value }))} placeholder="70145786" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Nombres Completos</label>
                    <Input value={form.nombres} onChange={(e) => setForm((prev) => ({ ...prev, nombres: e.target.value }))} placeholder="APELLIDOS, NOMBRES" />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit">Guardar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <button className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-red-700">
            <Trash2 size={16} />
            Eliminar Masivo
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full min-w-[1300px]">
            <thead className="sticky top-0 z-10 bg-teal-700 text-white">
              <tr className="text-sm">
                <th className="w-10 px-3 py-3 text-center font-semibold">#</th>
                <th className="w-52 px-3 py-3 text-left font-semibold">Empresa</th>
                <th className="w-24 px-3 py-3 text-left font-semibold">Sucursal</th>
                <th className="w-24 px-3 py-3 text-left font-semibold">Area</th>
                <th className="w-36 px-3 py-3 text-left font-semibold">Codigo de Empleado</th>
                <th className="w-36 px-3 py-3 text-left font-semibold">Numero de Documento</th>
                <th className="w-28 px-3 py-3 text-left font-semibold">Codigo de Equipo</th>
                <th className="px-3 py-3 text-left font-semibold">Nombres Completos</th>
                <th className="w-24 px-3 py-3 text-center font-semibold">Consultar</th>
                <th className="w-24 px-3 py-3 text-center font-semibold">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => <TableRowSkeleton key={`skeleton-${index}`} />)
              ) : marcaciones.length === 0 ? (
                <tr>
                  <td colSpan={10} className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500">No hay registros de personal para mostrar.</td>
                </tr>
              ) : (
                marcaciones.map((row: Marcacion, index: number) => (
                  <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="border-t border-slate-200 px-3 py-3 text-center text-slate-700"><input type="checkbox" /></td>
                    <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{row.empresa}</td>
                    <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{row.sucursal}</td>
                    <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{row.area}</td>
                    <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{row.codigoEmpleado}</td>
                    <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{row.numeroDocumento}</td>
                    <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{row.codigoEquipo}</td>
                    <td className="border-t border-slate-200 px-3 py-3 text-slate-700">{row.nombres}</td>
                    <td className="border-t border-slate-200 px-3 py-3 text-center">
                      <button onClick={() => setDetailMarcacion(row)} className="inline-flex rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100" aria-label="Consultar marcacion">
                        <Search size={16} />
                      </button>
                    </td>
                    <td className="border-t border-slate-200 px-3 py-3 text-center">
                      <button className="inline-flex rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100">
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

      <Dialog open={!!detailMarcacion} onOpenChange={(next) => !next && setDetailMarcacion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de marcacion</DialogTitle>
          </DialogHeader>
          {detailMarcacion && (
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <DetailItem label="Empresa" value={detailMarcacion.empresa} />
              <DetailItem label="Sucursal" value={detailMarcacion.sucursal} />
              <DetailItem label="Area" value={detailMarcacion.area} />
              <DetailItem label="Codigo de Empleado" value={detailMarcacion.codigoEmpleado} />
              <DetailItem label="Numero de Documento" value={detailMarcacion.numeroDocumento} />
              <DetailItem label="Codigo de Equipo" value={detailMarcacion.codigoEquipo} />
              <DetailItem label="Situacion" value={detailMarcacion.situacion} />
              <DetailItem label="Nombres Completos" value={detailMarcacion.nombres || "-"} />
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setDetailMarcacion(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm font-semibold text-slate-600">Total de registros: {pagination.totalItems}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => pagination.setCurrentPage(1)} disabled={pagination.currentPage === 1}>
            <ChevronsLeft size={20} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => pagination.setCurrentPage(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>
            <ChevronLeft size={20} />
          </Button>
          <span className="text-sm text-slate-700">
            Pagina {pagination.currentPage} de {pagination.totalPages}
          </span>
          <Button variant="outline" size="icon" onClick={() => pagination.setCurrentPage(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}>
            <ChevronRight size={20} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => pagination.setCurrentPage(pagination.totalPages)} disabled={pagination.currentPage === pagination.totalPages}>
            <ChevronsRight size={20} />
          </Button>
        </div>
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-slate-200">
      <td className="p-3"><Skeleton className="h-5 w-5 rounded" /></td>
      {Array.from({ length: 9 }).map((_, index) => (
        <td key={index} className="p-3">
          <Skeleton className="h-5 w-full" />
        </td>
      ))}
    </tr>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-700">{value || "-"}</p>
    </div>
  )
}
