import type { JustificacionForm } from "../interfaces/justificacion.interface"

export const asArray = (x: unknown): unknown[] => {
  if (Array.isArray(x)) return x
  if (x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results)) {
    return (x as { results: unknown[] }).results
  }
  return []
}

export const defaultForm: JustificacionForm = {
  motivo: "",
  tipo: "SALIDA",
  rango: "PARCIAL",
  fecha_inicio: "",
  fecha_fin: "",
  dias: "1",
  descripcion: "",
  tiene_adjunto: false,
  numero_documento: "",
  nombre_documento: "",
}
