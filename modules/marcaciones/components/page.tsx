import { apiEndpoints } from "@/lib/api-client"
import { ServerApiError, serverAuthRequest } from "@/lib/server-api"
import type { Marcacion } from "../interfaces/marcaciones.interface"
import { MarcacionesClientPage } from "./MarcacionesClientPage"

export interface MarcacionesInitialData {
  marcaciones: Marcacion[]
  totalItems: number
  totalPages: number
}

type MarcacionesApiResponse = {
  count?: number
  results?: Marcacion[]
}

const PAGE_SIZE = 20

async function getMarcacionesInitialData(): Promise<MarcacionesInitialData | null> {
  try {
    const data = (await serverAuthRequest(
      `${apiEndpoints.marcaciones}?paginated=1&lite=1&page=1&page_size=${PAGE_SIZE}`
    )) as MarcacionesApiResponse | Marcacion[]

    const marcaciones = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
        ? data.results
        : []
    const totalItems = Array.isArray(data) ? data.length : typeof data?.count === "number" ? data.count : marcaciones.length

    return {
      marcaciones,
      totalItems,
      totalPages: totalItems > 0 ? Math.max(1, Math.ceil(totalItems / PAGE_SIZE)) : 1,
    }
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 401) {
      return null
    }
    return null
  }
}

export default async function MarcacionesPage() {
  const initialData = await getMarcacionesInitialData()
  return <MarcacionesClientPage initialData={initialData} />
}
