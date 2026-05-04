'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import CafeteriaCard from './CafeteriaCard'
import CoffeeLoader from './CoffeeLoader'
import type { Cafeteria } from '@/types'

export default function CafeteriasView() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ciudad, setCiudad] = useState(searchParams.get('ciudad') || '')
  const [tipo, setTipo] = useState(searchParams.get('tipo') || '')
  const [query, setQuery] = useState('')

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

  // Filtro client-side por texto: nombre, ciudad, tipo, métodos disponibles, cafeteria_id
  const q = query.trim().toLowerCase()
  const visibles = q
    ? cafeterias.filter((c) => {
        const haystack = [
          c.nombre,
          c.ciudad,
          c.tipo,
          c.cafeteria_id,
          ...(Array.isArray(c.metodos_disponibles) ? c.metodos_disponibles : []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
    : cafeterias

  if (error) {
    return (
      <div className="page">
        <div className="error-state" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} /> {error} — Verifica que Neo4j AuraDB esté disponible y las credenciales sean correctas.
        </div>
      </div>
    )
  }

  return (
    <div className="page fade-in">
      {/* Filtros */}
      <div className="filter-bar">
        <input
          className="trace-input"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Buscar por nombre, ciudad, método…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
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
        {(ciudad || tipo || query) && (
          <button
            className="btn btn-outline"
            onClick={() => { setCiudad(''); setTipo(''); setQuery('') }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {loading ? (
        <CoffeeLoader text="Cargando cafeterías…" />
      ) : visibles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" style={{ display: 'flex', justifyContent: 'center' }}>
            <CoffeeLoader text="" size={64} /></div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, color: 'var(--text-dark)', marginBottom: 8 }}>
            No hay cafeterías
          </h3>
          <p>No se encontraron cafeterías con los filtros seleccionados.</p>
        </div>
      ) : (
        <>
          <div className="section-title">
            {visibles.length} {visibles.length === 1 ? 'cafetería' : 'cafeterías'}
            {ciudad ? ` en ${ciudad}` : ''}
            {tipo ? ` · ${tipo}` : ''}
            {query ? ` · «${query}»` : ''}
          </div>
          <div className="cafe-grid">
            {visibles.map((cafe) => (
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
