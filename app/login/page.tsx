import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { LoginFormInputs } from "@/modules/login/components/LoginFormInputs"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Card className="overflow-hidden">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold">Bienvenido nuevamente</h1>
                  <p className="text-muted-foreground">Inicia sesion en tu cuenta de Sisgat</p>
                </div>
                <LoginFormInputs />
              </div>
            </div>

            <div className="relative hidden md:block">
              <Image
                src="/muni-foto.avif"
                alt="Municipalidad"
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
