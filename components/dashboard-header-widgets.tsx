"use client"

import dynamic from "next/dynamic"

const DashboardRecentSearch = dynamic(
  () => import("@/components/dashboard-recent-search").then((mod) => mod.DashboardRecentSearch),
  {
    ssr: false,
    loading: () => (
      <div className="hidden h-10 w-full max-w-xl rounded-lg border border-slate-200 bg-white/80 sm:block" />
    ),
  }
)

const NotificationsMenu = dynamic(
  () => import("@/components/notifications-menu").then((mod) => mod.NotificationsMenu),
  {
    ssr: false,
    loading: () => <div className="h-9 w-9 rounded-lg border border-slate-200 bg-white/80" />,
  }
)

export function DashboardHeaderWidgets() {
  return (
    <DashboardRecentSearch />
  )
}

export function DashboardNotificationsWidget() {
  return (
    <NotificationsMenu />
  )
}
