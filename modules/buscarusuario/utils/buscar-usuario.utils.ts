import type { BuscarUsuarioFiltros, Usuario } from "../interfaces/buscar-usuario.interface"

function normalizeText(value: string): string {
  return value.trim().toLowerCase()
}

export function filtrarUsuarios(data: Usuario[], filtros: BuscarUsuarioFiltros): Usuario[] {
  const codigoFilter = normalizeText(filtros.codigo)
  const dniFilter = normalizeText(filtros.dni)
  const nombresFilter = normalizeText(filtros.nombres)

  return data.filter((item) => {
    const matchCodigo = !codigoFilter || item.codigo.toLowerCase().includes(codigoFilter)
    const matchDni = !dniFilter || item.dni.toLowerCase().includes(dniFilter)
    const matchNombres = !nombresFilter || item.nombres.toLowerCase().includes(nombresFilter)
    return matchCodigo && matchDni && matchNombres
  })
}

export function buildGestionarUsuarioUrl(usuario: Usuario): string {
  const params = new URLSearchParams({
    codigo: usuario.codigo,
    dni: usuario.dni,
    nombres: usuario.nombres,
  })

  return `/dashboard/gestionarusuario?${params.toString()}`
}
