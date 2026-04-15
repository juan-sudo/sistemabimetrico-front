"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Dispositivo, FormDispositivo, ProbarConexionPayload } from "../interfaces/dispositivos.interface"
import {
  createDispositivo,
  deleteDispositivo,
  fetchDispositivos,
  probarConexionDispositivo,
} from "../services/dispositivos.service"
import { asArray, filterDispositivos, formInicial } from "../utils/dispositivos.utils"

export function useDispositivosPage() {
  const token = useUserStore((s) => s.accessToken)

  const [busqueda, setBusqueda] = useState("")
  const [listaDispositivos, setListaDispositivos] = useState<Dispositivo[]>([])
  const [loading, setLoading] = useState(true)
  const [openNuevo, setOpenNuevo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testingId, setTestingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormDispositivo>(formInicial)

  const loadDevices = async () => {
    if (!token) return
    const data = await fetchDispositivos(token)
    setListaDispositivos(asArray(data) as Dispositivo[])
  }

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        await loadDevices()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar dispositivos")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [token])

  const dispositivos = useMemo(() => filterDispositivos(listaDispositivos, busqueda), [listaDispositivos, busqueda])

  const probarConexion = async (payload: ProbarConexionPayload) => {
    if (!token) return false
    try {
      const data = await probarConexionDispositivo(token, payload)
      const ok = Boolean((data as { ok?: boolean }).ok)
      const detalle = (data as { detalle?: string }).detalle || (ok ? "Conexion correcta." : "No se pudo conectar.")
      if (ok) toast.success(detalle)
      else toast.error(detalle)
      return ok
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo probar la conexion")
      return false
    }
  }

  const handleGuardar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!token) return
    if (!form.nombre.trim() || !form.direccion.trim() || !form.uso) return

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
      setListaDispositivos((prev) => prev.filter((item) => item.id !== id))
      toast.success("Dispositivo eliminado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar dispositivo")
    }
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

  return {
    token,
    busqueda,
    setBusqueda,
    dispositivos,
    loading,
    openNuevo,
    setOpenNuevo,
    saving,
    testing,
    testingId,
    setTestingId,
    form,
    setForm,
    formInicial,
    probarConexion,
    handleGuardar,
    handleEliminar,
    handleProbarTodos,
  }
}
