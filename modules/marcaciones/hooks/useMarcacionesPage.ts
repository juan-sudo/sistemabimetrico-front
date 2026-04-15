"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useUserStore from "@/stores/useUserStore"
import type { Catalog, FormState, Marcacion, Personal } from "../interfaces/marcaciones.interface"
import { fetchMarcacionesBaseData } from "../services/marcaciones.service"
import { asArray, buildOptions, createDefaultForm, mapPersonalesToMarcaciones } from "../utils/marcaciones.utils"

export function useMarcacionesPage() {
  const token = useUserStore((s) => s.accessToken)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [detailMarcacion, setDetailMarcacion] = useState<Marcacion | null>(null)
  const [marcaciones, setMarcaciones] = useState<Marcacion[]>([])
  const [form, setForm] = useState<FormState>(createDefaultForm)

  const [empresas, setEmpresas] = useState<Catalog[]>([])
  const [sucursales, setSucursales] = useState<Catalog[]>([])
  const [areas, setAreas] = useState<Catalog[]>([])
  const [tiposDoc, setTiposDoc] = useState<Catalog[]>([])
  const [tiposTrab, setTiposTrab] = useState<Catalog[]>([])
  const [categorias, setCategorias] = useState<Catalog[]>([])
  const [tiposSind, setTiposSind] = useState<Catalog[]>([])

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const [p, e, s, a, td, tt, c, ts] = await fetchMarcacionesBaseData(token)

        const pRows = asArray(p) as Personal[]
        const eRows = asArray(e) as Catalog[]
        const sRows = asArray(s) as Catalog[]
        const aRows = asArray(a) as Catalog[]
        const tdRows = asArray(td) as Catalog[]
        const ttRows = asArray(tt) as Catalog[]
        const cRows = asArray(c) as Catalog[]
        const tsRows = asArray(ts) as Catalog[]

        setEmpresas(eRows)
        setSucursales(sRows)
        setAreas(aRows)
        setTiposDoc(tdRows)
        setTiposTrab(ttRows)
        setCategorias(cRows)
        setTiposSind(tsRows)
        setMarcaciones(mapPersonalesToMarcaciones(pRows, eRows, sRows, aRows))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cargar datos para marcaciones")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [token])

  const tipoDocumentoOptions = useMemo(() => buildOptions(tiposDoc, "descripcion"), [tiposDoc])
  const tipoTrabajadorOptions = useMemo(() => buildOptions(tiposTrab, "descripcion"), [tiposTrab])
  const categoriaOptions = useMemo(() => buildOptions(categorias, "descripcion"), [categorias])
  const sindicatoOptions = useMemo(() => buildOptions(tiposSind, "descripcion"), [tiposSind])
  const empresaOptions = useMemo(() => buildOptions(empresas, "razon_social"), [empresas])
  const sucursalOptions = useMemo(() => buildOptions(sucursales, "nombre"), [sucursales])
  const areaOptions = useMemo(() => buildOptions(areas, "nombre"), [areas])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.codigoEmpleado.trim() || !form.numeroDocumento.trim()) return

    const nuevo: Marcacion = {
      id: Date.now(),
      empresa: form.empresa === "Todos" ? "" : form.empresa,
      sucursal: form.sucursal === "Todos" ? "" : form.sucursal,
      area: form.area === "Todos" ? "" : form.area,
      codigoEmpleado: form.codigoEmpleado.trim(),
      numeroDocumento: form.numeroDocumento.trim(),
      codigoEquipo: form.codigoEquipo.trim() || form.codigoEmpleado.trim(),
      nombres: form.nombres.trim(),
      situacion: form.situacion,
    }

    setMarcaciones((prev) => [nuevo, ...prev])
    setForm(createDefaultForm())
    setOpen(false)
  }

  return {
    token,
    open,
    setOpen,
    loading,
    detailMarcacion,
    setDetailMarcacion,
    marcaciones,
    form,
    setForm,
    tipoDocumentoOptions,
    tipoTrabajadorOptions,
    categoriaOptions,
    sindicatoOptions,
    empresaOptions,
    sucursalOptions,
    areaOptions,
    onSubmit,
  }
}
