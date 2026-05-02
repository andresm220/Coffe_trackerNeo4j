'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import CafeteriaCard from './CafeteriaCard'
import type { Cafeteria } from '@/types'

export default function CafeteriasView() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ciudad, setCiudad] = useState(searchParams.get('ciudad') || '')
  const [tipo, setTipo] = useState(searchParams.get('tipo') || '')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (ciudad) params.set('ciudad', ciudad)
        if (tipo) params.set('tipo', tipo)
        const res = await fetch(`/api/cafeterias?${params}`)
        if (!res.ok) throw new Error('Error al cargar cafeterías')
        const data = await res.json()
        setCafeterias(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [ciudad, tipo])

  const ciudades = Array.from(new Set(cafeterias.map((c) => c.ciudad))).sort()
  const tipos = Array.from(new Set(cafeterias.map((c) => c.tipo))).sort()

  if (error) {
    return (
      <div className="page">
        <div className="error-state">
          ⚠️ {error} — Verifica que Neo4j AuraDB esté disponible y las credenciales sean correctas.
        </div>
      </div>
    )
  }

  return (
    <div className="page fade-in">
      {/* Filtros */}
      <div className="filter-bar">
        <select
          className="filter-select"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
        >
          <option key="__all" value="">Todas las ciudades</option>
          {ciudades.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option key="__all" value="">Todos los tipos</option>
          {tipos.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {(ciudad || tipo) && (
          <button
            className="btn btn-outline"
            onClick={() => { setCiudad(''); setTipo('') }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">☕ Cargando cafeterías…</div>
      ) : cafeterias.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">☕</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, color: 'var(--text-dark)', marginBottom: 8 }}>
            No hay cafeterías
          </h3>
          <p>No se encontraron cafeterías con los filtros seleccionados.</p>
        </div>
      ) : (
        <>
          <div className="section-title">
            {cafeterias.length} {cafeterias.length === 1 ? 'cafetería' : 'cafeterías'}
            {ciudad ? ` en ${ciudad}` : ''}
            {tipo ? ` · ${tipo}` : ''}
          </div>
          <div className="cafe-grid">
            {cafeterias.map((cafe) => (
              <CafeteriaCard
                key={cafe.cafeteria_id}
                cafeteria={cafe}
                onClick={() => router.push(`/trazabilidad?cafeteria=${cafe.cafeteria_id}`)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
