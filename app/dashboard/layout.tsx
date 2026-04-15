import dynamic from "next/dynamic"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggleButton } from "@/components/theme-toggle"

const DashboardRecentSearch = dynamic(
  () => import("@/components/dashboard-recent-search").then((mod) => mod.DashboardRecentSearch),
  {
    ssr: false,
    loading: () => <div className="hidden h-10 w-full max-w-xl rounded-lg border border-slate-200 bg-white md:block" />,
  }
)

const NotificationsMenu = dynamic(
  () => import("@/components/notifications-menu").then((mod) => mod.NotificationsMenu),
  {
    ssr: false,
    loading: () => <div className="h-9 w-9 rounded-lg border border-slate-200 bg-white" />,
  }
)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset className="min-w-0 bg-slate-50/50">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
            <div className="flex h-16 items-center gap-3 px-3 sm:px-4 lg:px-6">
              <SidebarTrigger className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50" />

              <DashboardRecentSearch />

              <ThemeToggleButton className="ml-auto h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50" />
              <NotificationsMenu />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-0">
            <div className="w-full space-y-6">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
