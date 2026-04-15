export type Dispositivo = {
  id: number
  nombre: string
  direccion_tipo: "IP" | "DOMINIO"
  direccion: string
  comunicacion: string
  puerto: number
  uso: "ASISTENCIA" | "ACCESO"
  activo: boolean
}

export type FormDispositivo = {
  nombre: string
  direccionTipo: "ip" | "dominio"
  direccion: string
  comunicacion: string
  puerto: string
  uso: "" | "ASISTENCIA" | "ACCESO"
}

export type ProbarConexionPayload = {
  dispositivo_id?: number
  nombre?: string
  direccion?: string
  puerto?: string | number
}
