import type { Area, AreaPayload, AreaTipo, FormState } from "../interfaces/area"

export const emptyForm = (): FormState => ({
  codigo: "",
  nombre: "",
  tipo: "GERENCIA",
  parent: "",
  activo: true,
})

export const asArray = <T>(x: unknown): T[] =>
  Array.isArray(x) ? x : x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results) ? ((x as { results: unknown[] }).results as T[]) : []

export const tipoLabel: Record<AreaTipo, string> = {
  GERENCIA: "Gerencia",
  OFICINA: "Oficina",
  SUBGERENCIA: "Subgerencia",
  UNIDAD: "Unidad",
}

export const needsParent = (tipo: AreaTipo) => tipo === "SUBGERENCIA" || tipo === "UNIDAD"

export const buildAreaPayload = (form: FormState, sucursalId: string): AreaPayload => ({
  sucursal: Number(sucursalId),
  codigo: form.codigo.trim(),
  nombre: form.nombre.trim(),
  tipo: form.tipo,
  parent: needsParent(form.tipo) ? (form.parent ? Number(form.parent) : null) : null,
  activo: form.activo,
})

export const filterParents = (areas: Area[], sucursalId: string, tipo: AreaTipo, editingId: number | null) => {
  const base = areas.filter((x) => x.sucursal === Number(sucursalId) && x.id !== editingId)
  if (tipo === "SUBGERENCIA") return base.filter((x) => x.tipo === "GERENCIA")
  if (tipo === "UNIDAD") return base.filter((x) => x.tipo === "SUBGERENCIA")
  return []
}
