"use client"

import * as React from "react"

import { dashboardNavItems } from "@/components/dashboard-nav-config"
import { NavMain } from "@/components/nav-main"

import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import useUserStore from "@/stores/useUserStore"

type ModulePermission = { modulo?: string; puede_ver?: boolean } | null | undefined

function filterNavItems(
  navMain: typeof dashboardNavItems,
  hasFullAccess: boolean,
  permissions: ModulePermission[] | null,
) {
  const canView = (moduleCode?: string) => {
    if (!moduleCode) return true
    if (hasFullAccess) return true
    if (permissions === null) return true
    const found = permissions.find((item) => item?.modulo === moduleCode)
    return Boolean(found?.puede_ver)
  }
  return navMain
    .map((group) => ({
      ...group,
      items: group.items?.filter((item) => canView(item.moduleCode)),
    }))
    .filter((group) => (group.items ? group.items.length > 0 : true))
}

const DEFAULT_USER = { name: "shadcn", email: "m@example.com", avatar: "/avatars/shadcn.jpg" }
const TEAM = { name: "SIGA", plan: "Municipalidad", subtitle: "Sistema de Gestion Administrativa" }

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const loggedUser = useUserStore((state) => state.user)
  const hasFullAccess = Boolean(loggedUser?.is_superuser || loggedUser?.is_staff)
  const permissions = Array.isArray(loggedUser?.module_permissions) ? loggedUser.module_permissions as ModulePermission[] : null

  const user = React.useMemo(() => ({
    name: loggedUser?.username || loggedUser?.name || DEFAULT_USER.name,
    email: loggedUser?.email || DEFAULT_USER.email,
    avatar: DEFAULT_USER.avatar,
  }), [loggedUser?.username, loggedUser?.name, loggedUser?.email])

  const navItems = React.useMemo(
    () => filterNavItems(dashboardNavItems, hasFullAccess, permissions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasFullAccess, loggedUser?.module_permissions],
  )

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200/80 bg-white/95" {...props}>
      <SidebarHeader className="border-b border-slate-200/70 p-2">
        <TeamSwitcher team={TEAM} />
      </SidebarHeader>
      <SidebarContent className="px-2 py-3">
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-200/70 p-2">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
