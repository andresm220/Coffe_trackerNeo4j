import { Suspense } from 'react'
import CafeteriasView from '@/components/CafeteriasView'
import Topbar from '@/components/Topbar'
import CoffeeLoader from '@/components/CoffeeLoader'

export default function HomePage() {
  return (
    <>
      <Topbar title="Cafeterías" subtitle="Descubre el origen de tu café" />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Suspense fallback={<CoffeeLoader text="Cargando cafeterías…" />}>
          <CafeteriasView />
        </Suspense>
      </div>
    </>
  )
}
