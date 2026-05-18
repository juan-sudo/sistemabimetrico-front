import { Fingerprint } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { GenericPageSkeleton } from '@/components/generic-page-skeleton'

export default function Loading() {
  return (
    <PageShell icon={<Fingerprint size={22} />} title="Gestión de Marcaciones" description="Administra y visualiza las marcaciones del personal.">
      <GenericPageSkeleton />
    </PageShell>
  )
  // Este componente ahora solo necesita renderizar el esqueleto del contenido, no el PageShell completo.
  return <GenericPageSkeleton />
}