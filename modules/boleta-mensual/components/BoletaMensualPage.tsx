"use client"

import BoletaMensualFilters from "./BoletaMensualFilters"
import BoletaMensualHeader from "./BoletaMensualHeader"
import BoletaMensualTable from "./BoletaMensualTable"
import useBoletaMensualModule from "../hooks/useBoletaMensualModule"
import type { BoletaMensualInitialData } from "../interfaces/boleta-mensual"

type Props = {
  initialData: BoletaMensualInitialData | null
}

export default function BoletaMensualPage({ initialData }: Props) {
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
  } = useBoletaMensualModule({ initialData })

  if (!token && !initialData) return <section className="p-6 text-sm text-slate-600">Inicia sesion para continuar.</section>

  return (
    <>
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
    </>
  )
}
