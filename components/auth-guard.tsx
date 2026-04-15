"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import useUserStore from "@/stores/useUserStore"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const hasHydrated = useUserStore((state) => state.hasHydrated)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`)
    }
  }, [hasHydrated, isAuthenticated, pathname, router])

  if (!hasHydrated) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
