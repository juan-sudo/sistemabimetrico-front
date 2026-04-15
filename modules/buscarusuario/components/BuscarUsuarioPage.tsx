"use client"

import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, IdCard, User, BadgeCheck } from "lucide-react"
import { useBuscarUsuario } from "../hooks/useBuscarUsuario"
import { buildGestionarUsuarioUrl } from "../utils/buscar-usuario.utils"

export default function BuscarUsuarioPage() {
  const { filtros, filteredData, setCodigo, setDni, setNombres } = useBuscarUsuario()

  return (
    <div className="max-w-7xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Búsqueda de usuarios</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Código"
                value={filtros.codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="relative">
              <IdCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="DNI"
                value={filtros.dni}
                onChange={(e) => setDni(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nombres completos"
                value={filtros.nombres}
                onChange={(e) => setNombres(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Nombres completos</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <TableRow key={item.codigo} className="transition-colors hover:bg-muted/50">
                      <TableCell>{item.codigo}</TableCell>
                      <TableCell>{item.dni}</TableCell>
                      <TableCell>{item.nombres}</TableCell>
                      <TableCell>
                        <Link href={buildGestionarUsuarioUrl(item)}>
                          <Button variant="outline" size="icon">
                            <BadgeCheck className="h-4 w-4 text-blue-600" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                      No hay resultados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
