"use client"

import AreaFilters from "./AreaFilters"
import AreaHeader from "./AreaHeader"
import { AreaPageSkeleton } from "./AreaPageSkeleton"
import AreaTable from "./AreaTable"
import useAreaModule from "../hooks/useAreaModule"

export default function AreaPage() {
  const {
    token,
    loading,
    initialLoading,
    isFetching,
    saving,
    open,
    editingId,
    empresas,
    sucursalesFiltradas,
    areasFiltradas,
    areaById,
    empresaId,
    sucursalId,
    search,
    setSearch,
    page,
    setPage,
    totalItems,
    totalPages,
    canPrev,
    canNext,
    form,
    parentsDisponibles,
    setForm,
    setSucursalId,
    onOpenChange,
    onEmpresaChange,
    onSubmit,
    onEdit,
    onDelete,
    resetForm,
  } = useAreaModule()

  if (!token) return <section className="p-6 text-sm text-slate-600">Inicia sesion para continuar.</section>

  return (
    <>
        <AreaHeader
          open={open}
          editingId={editingId}
          saving={saving}
          form={form}
          parentsDisponibles={parentsDisponibles}
          setForm={setForm}
          onSubmit={onSubmit}
          onOpenChange={onOpenChange}
          onCreateNew={() => {
            resetForm()
            onOpenChange(true)
          }}
        />

        <AreaFilters
          empresaId={empresaId}
          sucursalId={sucursalId}
          search={search}
          empresas={empresas}
          sucursales={sucursalesFiltradas}
          onSearchChange={setSearch}
          onEmpresaChange={onEmpresaChange}
          onSucursalChange={setSucursalId}
        />

        <p className="px-1 text-sm font-semibold text-slate-600">
          {isFetching ? "Actualizando..." : `Registros: ${totalItems}`}
        </p>

        {initialLoading ? (
          <AreaPageSkeleton />
        ) : (
          <>
            <AreaTable loading={loading} areas={areasFiltradas} areaById={areaById} onEdit={onEdit} onDelete={onDelete} />
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-sm text-slate-600">
                Pagina {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex h-9 items-center rounded-md border border-slate-300 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={!canPrev || loading}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 items-center rounded-md border border-slate-300 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={!canNext || loading}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
    </>
  )
}
