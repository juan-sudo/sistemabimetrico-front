import type { GestionarUsuarioData } from "../interfaces/gestionarusuario.interface"

export function getGestionarUsuarioMockData(): GestionarUsuarioData {
  return {
    usuarios: [{ codigo: "A001", dni: "12345678", nombres: "Juan Pérez" }],
    licencias: [
      {
        numero: "004",
        ubicacion: "Calle Los Pinos 567, San Isidro, Lima",
        licencia: "Licencia de Servicios - 157",
        fecha: "2024-02-10",
        estado: "transferida",
      },
      {
        numero: "005",
        ubicacion: "Av. Ejército 890, Cusco",
        licencia: "Licencia Industrial - 158",
        fecha: "2023-11-20",
        estado: "eliminado",
      },
      {
        numero: "006",
        ubicacion: "Jr. Unión 345, Centro de Lima",
        licencia: "Licencia Comercial - 159",
        fecha: "2024-03-05",
        estado: "agua",
      },
    ],
  }
}
