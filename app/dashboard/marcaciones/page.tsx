import { Suspense } from 'react'
import { Fingerprint } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import MarcacionesPage from '../../../modules/marcaciones/components/page'
import Loading from './loading'

export default function Page() {
  return (
    <PageShell icon={<Fingerprint size={22} />} title="Gestión de Marcaciones" description="Administra y visualiza las marcaciones del personal.">
      <Suspense fallback={<Loading />}>
        <MarcacionesPage />
      </Suspense>
    </PageShell>
  )
}
