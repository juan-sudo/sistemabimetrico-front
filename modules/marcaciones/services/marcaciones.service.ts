import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { Marcacion } from "../interfaces/marcaciones.interface"

interface GetMarcacionesParams {
  token: string
  page?: number
  busqueda?: string
}

type MarcacionesApiResponse = {
  count?: number
  results?: Marcacion[]
}

interface MarcacionesPaginatedResponse {
  marcaciones: Marcacion[]
  totalItems: number
  totalPages: number
}

const PAGE_SIZE = 20

export const getMarcaciones = async ({
  token,
  page = 1,
  busqueda = "",
}: GetMarcacionesParams): Promise<MarcacionesPaginatedResponse> => {
  const params = new URLSearchParams()
  params.append("paginated", "1")
  params.append("lite", "1")
  params.append("page", String(page))
  params.append("page_size", String(PAGE_SIZE))
  if (busqueda) {
    params.append("search", busqueda)
  }

  const data = (await authRequest(`${apiEndpoints.marcaciones}?${params.toString()}`, {
    token,
  })) as MarcacionesApiResponse | Marcacion[]

  if (Array.isArray(data)) {
    return {
      marcaciones: data,
      totalItems: data.length,
      totalPages: 1,
    }
  }

  const marcaciones = Array.isArray(data.results) ? data.results : []
  const totalItems = typeof data.count === "number" ? data.count : marcaciones.length

  return {
    marcaciones,
    totalItems,
    totalPages: totalItems > 0 ? Math.max(1, Math.ceil(totalItems / PAGE_SIZE)) : 1,
  }
}
