"use client"

import dynamic from "next/dynamic"
import { SucursalPageSkeleton } from "@/modules/sucursal/components/SucursalPageSkeleton"

const SucursalPage = dynamic(() => import("../../../modules/sucursal/components/SucursalPage"), {
  ssr: false,
  loading: () => <SucursalPageSkeleton />,
})

export function SucursalClient() {
  return <SucursalPage />
}

