import { useEffect, useState, type FormEvent } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { FormState, Marcacion } from "../interfaces/marcaciones.interface"
import type { MarcacionesInitialData } from "../components/page"
import { getMarcaciones } from "../services/marcaciones.service"
import { createDefaultForm } from "../utils/marcaciones.utils"

interface UseMarcacionesPageProps {
  initialData: MarcacionesInitialData | null
}

export const useMarcacionesPage = ({ initialData }: UseMarcacionesPageProps) => {
  const token = useUserStore((state) => state.accessToken)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [marcaciones, setMarcaciones] = useState<Marcacion[]>(initialData?.marcaciones ?? [])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [detailMarcacion, setDetailMarcacion] = useState<Marcacion | null>(null)
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1)
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 1)
  const [totalItems, setTotalItems] = useState(initialData?.totalItems ?? 0)
  const [busqueda, setBusqueda] = useState(searchParams.get("busqueda") ?? "")
  const [debouncedBusqueda, setDebouncedBusqueda] = useState(searchParams.get("busqueda") ?? "")
  const [form, setForm] = useState<FormState>(createDefaultForm())

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedBusqueda(busqueda.trim())
    }, 400)
    return () => window.clearTimeout(timer)
  }, [busqueda])

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(currentPage))
    if (debouncedBusqueda) {
      params.set("busqueda", debouncedBusqueda)
    } else {
      params.delete("busqueda")
    }
    router.replace(`${pathname}?${params.toString()}`)
  }, [currentPage, debouncedBusqueda, pathname, router, searchParams])

  useEffect(() => {
    if (!token) return

    if (currentPage === 1 && debouncedBusqueda === "" && initialData) {
      setMarcaciones(initialData.marcaciones)
      setTotalPages(initialData.totalPages)
      setTotalItems(initialData.totalItems)
      return
    }

    const fetchMarcaciones = async () => {
      setLoading(true)
      try {
        const data = await getMarcaciones({
          token,
          page: currentPage,
          busqueda: debouncedBusqueda,
        })
        setMarcaciones(data.marcaciones)
        setTotalPages(data.totalPages)
        setTotalItems(data.totalItems)
      } catch {
        toast.error("Error al cargar las marcaciones")
      } finally {
        setLoading(false)
      }
    }

    void fetchMarcaciones()
  }, [currentPage, debouncedBusqueda, initialData, token])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    toast.success("Formulario enviado (simulacion)")
    setOpen(false)
  }

  return {
    token,
    marcaciones,
    loading,
    open,
    setOpen,
    detailMarcacion,
    setDetailMarcacion,
    form,
    setForm,
    onSubmit,
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      setCurrentPage,
    },
    search: {
      busqueda,
      setBusqueda,
    },
  }
}
