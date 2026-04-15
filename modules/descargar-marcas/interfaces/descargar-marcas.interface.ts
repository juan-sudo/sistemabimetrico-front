export type Dispositivo = {
  id: number
  nombre: string
  direccion: string
  puerto: number
  uso: string
  activo: boolean
}

export type DescargaTab = "dispositivo" | "usb" | "excel"
