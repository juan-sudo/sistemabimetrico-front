import type { Usuario } from "../interfaces/buscar-usuario.interface"

export function getUsuariosMock(): Usuario[] {
  return [
    { codigo: "A001", dni: "12345678", nombres: "Juan Pérez" },
    { codigo: "A002", dni: "87654321", nombres: "María López" },
  ]
}
