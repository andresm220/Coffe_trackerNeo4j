import { Suspense } from 'react'
import CafeteriasView from '@/components/CafeteriasView'
import Topbar from '@/components/Topbar'

export default function HomePage() {
  return (
    <>
      <Topbar title="Cafeterías" subtitle="Descubre el origen de tu café" />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Suspense fallback={<div className="loading-state">☕ Cargando cafeterías…</div>}>
          <CafeteriasView />
        </Suspense>
      </div>
    </>
  )
}
