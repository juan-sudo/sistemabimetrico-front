"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLoginForm } from "../hooks/useLoginForm"

export function LoginFormInputs() {
  const { values, isSubmitting, handleInputChange, handleSubmit } = useLoginForm()

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-2">
        <Label htmlFor="username">Usuario</Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={values.username}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Contrasena</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleInputChange}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Ingresando..." : "Iniciar sesion"}
      </Button>
    </form>
  )
}
