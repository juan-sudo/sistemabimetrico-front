"use client"

import { FormEvent, useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Dispositivo, FormDispositivo, ProbarConexionPayload } from "../interfaces/dispositivos.interface"
import {
  createDispositivo,
  deleteDispositivo,
  fetchDispositivos,
  probarConexionDispositivo,
} from "../services/dispositivos.service"
import { formInicial } from "../utils/dispositivos.utils"

const SEARCH_DEBOUNCE_MS = 350

export function useDispositivosPage() {
  const token = useUserStore((s) => s.accessToken)

  const [busqueda, setBusqueda] = useState("")
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("")
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [openNuevo, setOpenNuevo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testingId, setTestingId] = useState<number | null>(null)
  const [totalItems, setTotalItems] = useState(0)
  const [form, setForm] = useState<FormDispositivo>(formInicial)

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedBusqueda(busqueda.trim()), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [busqueda])

  const loadDevices = useCallback(async () => {
    if (!token) return
    const data = await fetchDispositivos(token, { paginated: false, search: debouncedBusqueda })
    setDispositivos(data.results)
    setTotalItems(data.count)
  }, [debouncedBusqueda, token])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setInitialLoading(false)
      return
    }
    const run = async () => {
      try {
        setLoading(true)
        setIsFetching(true)
        await loadDevices()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar dispositivos")
      } finally {
        setLoading(false)
        setInitialLoading(false)
        setIsFetching(false)
      }
    }
    void run()
  }, [token, loadDevices])

  const probarConexion = async (payload: ProbarConexionPayload): Promise<boolean> => {
    if (!token) return false
    try {
      const data = await probarConexionDispositivo(token, payload) as { ok?: boolean; detalle?: string }
      const ok = Boolean(data.ok)
      const detalle = data.detalle || (ok ? "Conexion correcta." : "No se pudo conectar.")
      if (ok) toast.success(detalle)
      else toast.error(detalle)
      return ok
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo probar la conexion")
      return false
    }
  }

  const handleProbarDispositivo = async (id: number) => {
    setTestingId(id)
    await probarConexion({ dispositivo_id: id })
    setTestingId(null)
  }

  const handleProbarTodos = async () => {
    if (!token || dispositivos.length === 0) return
    setTesting(true)
    let okCount = 0
    for (const item of dispositivos) {
      const ok = await probarConexion({ dispositivo_id: item.id })
      if (ok) okCount += 1
    }
    setTesting(false)
    toast.success(`Pruebas finalizadas. Conectados: ${okCount}/${dispositivos.length}`)
  }

  const handleGuardar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!token || !form.nombre.trim() || !form.direccion.trim() || !form.uso) return
    try {
      setSaving(true)
      await createDispositivo(token, {
        nombre: form.nombre.trim(),
        direccion_tipo: form.direccionTipo === "ip" ? "IP" : "DOMINIO",
        direccion: form.direccion.trim(),
        comunicacion: form.comunicacion.trim() || "TCP/IP",
        puerto: Number(form.puerto || "4370"),
        uso: form.uso,
        activo: true,
      })
      await loadDevices()
      setOpenNuevo(false)
      setForm(formInicial)
      toast.success("Dispositivo guardado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar dispositivo")
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async (id: number) => {
    if (!token) return
    try {
      await deleteDispositivo(token, id)
      await loadDevices()
      toast.success("Dispositivo eliminado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar dispositivo")
    }
  }

  return {
    token,
    busqueda,
    setBusqueda,
    dispositivos,
    loading,
    initialLoading,
    isFetching,
    openNuevo,
    setOpenNuevo,
    saving,
    testing,
    testingId,
    totalItems,
    form,
    setForm,
    formInicial,
    probarConexion,
    handleProbarDispositivo,
    handleGuardar,
    handleEliminar,
    handleProbarTodos,
  }
}
