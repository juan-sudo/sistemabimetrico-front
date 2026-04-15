"use client"

import BoletaMensualFilters from "./BoletaMensualFilters"
import BoletaMensualHeader from "./BoletaMensualHeader"
import BoletaMensualTable from "./BoletaMensualTable"
import useBoletaMensualModule from "../hooks/useBoletaMensualModule"

export default function BoletaMensualPage() {
  const {
    token,
    month,
    year,
    search,
    selected,
    loading,
    generating,
    filteredRows,
    selectedIds,
    periodo,
    PEN,
    setMonth,
    setYear,
    setSearch,
    setSelected,
    toggleAllVisible,
    handleGenerarBoletas,
    handleDescargarExcel,
    handleDescargarPdf,
  } = useBoletaMensualModule()

  if (!token) return <section className="p-6 text-sm text-slate-600">Inicia sesion para continuar.</section>

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-[radial-gradient(circle_at_top_right,#dcfce7_0%,#f8fafc_45%,#eef2ff_100%)] p-3 md:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <BoletaMensualHeader
          generating={generating}
          hasSelection={selectedIds.length > 0}
          onGenerar={handleGenerarBoletas}
          onPdf={handleDescargarPdf}
          onExcel={handleDescargarExcel}
        />

        <BoletaMensualFilters month={month} year={year} search={search} onMonthChange={setMonth} onYearChange={setYear} onSearchChange={setSearch} />

        <BoletaMensualTable
          loading={loading}
          rows={filteredRows}
          selected={selected}
          selectedCount={selectedIds.length}
          currency={PEN}
          onToggleAllVisible={toggleAllVisible}
          setSelected={setSelected}
        />

        <p className="px-1 text-sm font-semibold text-slate-600">
          Periodo: {periodo} | Seleccionados: {selectedIds.length}
        </p>
      </div>
    </section>
  )
}
