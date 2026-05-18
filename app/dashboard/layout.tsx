import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeaderWidgets, DashboardNotificationsWidget } from "@/components/dashboard-header-widgets"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggleButton } from "@/components/theme-toggle"

const ACCESS_COOKIE = "sb_access_token"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value || ""

  if (!accessToken) {
    redirect("/login?next=/dashboard")
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="min-w-0 bg-slate-50/50">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white">
          <div className="flex h-16 items-center gap-3 px-3 sm:px-4 lg:px-6">
            <SidebarTrigger className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50" />

            <DashboardHeaderWidgets />

            <ThemeToggleButton className="ml-auto h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50" />
            <DashboardNotificationsWidget />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-0">
          <div className="w-full space-y-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
