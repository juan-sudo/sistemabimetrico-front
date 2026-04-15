import type { Categoria, CategoriaFormState, CategoriaPayload } from "../interfaces/categoria.interface"

export const emptyCategoriaForm = (): CategoriaFormState => ({
  codigo: "",
  descripcion: "",
  periodos_vacacionales: false,
  dias_por_periodo: "0",
  activo: true,
})

export const asArray = (x: unknown): unknown[] => {
  if (Array.isArray(x)) return x
  if (x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results)) {
    return (x as { results: unknown[] }).results
  }
  return []
}

export const toCategoriaArray = (x: unknown): Categoria[] => asArray(x) as Categoria[]

export const filterCategorias = (items: Categoria[], search: string): Categoria[] => {
  const term = search.trim().toLowerCase()
  if (!term) return items
  return items.filter((x) => `${x.codigo} ${x.descripcion}`.toLowerCase().includes(term))
}

export const toCategoriaPayload = (form: CategoriaFormState): CategoriaPayload => ({
  codigo: form.codigo.trim(),
  descripcion: form.descripcion.trim(),
  periodos_vacacionales: form.periodos_vacacionales,
  dias_por_periodo: form.periodos_vacacionales ? Number(form.dias_por_periodo || "0") : 0,
  activo: form.activo,
})
