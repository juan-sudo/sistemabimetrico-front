import type { Dispositivo, FormDispositivo } from "../interfaces/dispositivos.interface"

export const formInicial: FormDispositivo = {
  nombre: "",
  direccionTipo: "ip",
  direccion: "",
  comunicacion: "TCP/IP",
  puerto: "4370",
  uso: "",
}

export const asArray = (x: unknown): unknown[] => {
  if (Array.isArray(x)) return x
  if (x && typeof x === "object" && Array.isArray((x as { results?: unknown[] }).results)) {
    return (x as { results: unknown[] }).results
  }
  return []
}

export function filterDispositivos(items: Dispositivo[], busqueda: string): Dispositivo[] {
  const term = busqueda.trim().toLowerCase()
  if (!term) return items
  return items.filter((item) =>
    `${item.nombre} ${item.comunicacion} ${item.direccion} ${item.uso}`.toLowerCase().includes(term)
  )
}
