"use client"

import { useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { loginRequest } from "@/lib/api-client"
import useUserStore from "@/stores/useUserStore"

type LoginFormValues = {
  username: string
  password: string
}

type InputChangeEvent = ChangeEvent<HTMLInputElement>
type SubmitEvent = FormEvent<HTMLFormElement>

export function useLoginForm() {
  const setSession = useUserStore((state) => state.setSession)
  const router = useRouter()
  const [values, setValues] = useState<LoginFormValues>({
    username: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (event: InputChangeEvent) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const data = await loginRequest(values.username.trim(), values.password)
      setSession({
        user: data.user,
        accessToken: data.access,
        refreshToken: data.refresh,
      })
      toast.success(`Bienvenido ${data.user?.username || "usuario"}`)
      router.replace("/dashboard")
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error && error.message ? error.message : "No se pudo iniciar sesion"
      const status =
        typeof error === "object" && error !== null && "status" in error ? (error as { status?: number }).status : undefined

      if (typeof status === "number" && status >= 500 && status !== 503) {
        console.error("Error al iniciar sesion:", error)
      }

      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    values,
    isSubmitting,
    handleInputChange,
    handleSubmit,
  }
}
