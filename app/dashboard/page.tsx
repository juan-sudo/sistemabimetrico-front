import { apiEndpoints } from "@/lib/api-client"
import { ServerApiError, serverAuthRequest } from "@/lib/server-api"
import { DashboardHomeClient } from "./_components/DashboardHomeClient"
import type { DashboardPayload } from "./_components/dashboard-home.types"

async function getInitialDashboardData(): Promise<DashboardPayload | null> {
  try {
    return (await serverAuthRequest(`${apiEndpoints.dashboardResumen}?days=30`)) as DashboardPayload
  } catch (err) {
    if (err instanceof ServerApiError && err.status === 401) {
      return null
    }
    throw err
  }
}

export default async function Page() {
  const initialData = await getInitialDashboardData()

  return <DashboardHomeClient initialData={initialData} />
}
