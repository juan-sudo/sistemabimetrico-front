"use client"

import AreaFilters from "./AreaFilters"
import AreaHeader from "./AreaHeader"
import AreaTable from "./AreaTable"
import useAreaModule from "../hooks/useAreaModule"

export default function AreaPage() {
  const {
    token,
    loading,
    saving,
    open,
    editingId,
    empresas,
    sucursalesFiltradas,
    areasFiltradas,
    areaById,
    empresaId,
    sucursalId,
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
    <section className="min-h-[calc(100vh-7rem)] bg-[radial-gradient(circle_at_top_right,#dcfce7_0%,#f8fafc_45%,#eef2ff_100%)] p-3 md:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-5">
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
          empresas={empresas}
          sucursales={sucursalesFiltradas}
          onEmpresaChange={onEmpresaChange}
          onSucursalChange={setSucursalId}
        />

        <AreaTable loading={loading} areas={areasFiltradas} areaById={areaById} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </section>
  )
}
