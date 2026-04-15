import type { Cargo, CargoFormState } from "../interfaces/cargo.interface"

export const emptyCargoForm = (): CargoFormState => ({
  codigo: "",
  descripcion: "",
  activo: true,
})

export const asArray = (x: unknown): unknown[] => {
  if (Array.isArray(x)) return x
  if (x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results)) {
    return (x as { results: unknown[] }).results
  }
  return []
}

export const toCargoArray = (x: unknown): Cargo[] => asArray(x) as Cargo[]

export const filterCargos = (items: Cargo[], search: string): Cargo[] => {
  const term = search.trim().toLowerCase()
  if (!term) return items
  return items.filter((x) => `${x.codigo} ${x.descripcion}`.toLowerCase().includes(term))
}
