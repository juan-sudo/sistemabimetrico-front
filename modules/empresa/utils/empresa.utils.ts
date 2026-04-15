import type { Empresa, EmpresaFormState, EmpresaPayload } from "../interfaces/empresa.interface"

export const emptyEmpresaForm = (): EmpresaFormState => ({
  codigo: "",
  razon_social: "",
  ruc: "",
  correo: "",
  activo: true,
})

export const asArray = (x: unknown): unknown[] => {
  if (Array.isArray(x)) return x
  if (x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results)) {
    return (x as { results: unknown[] }).results
  }
  return []
}

export const toEmpresaArray = (x: unknown): Empresa[] => asArray(x) as Empresa[]

export const toEmpresaPayload = (form: EmpresaFormState): EmpresaPayload => ({
  codigo: form.codigo.trim(),
  razon_social: form.razon_social.trim(),
  ruc: form.ruc.trim(),
  correo: form.correo.trim(),
  activo: form.activo,
})
