'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, AlertTriangle } from 'lucide-react'

export default function TrazabilidadSearch() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const loteId = query.trim()
    if (!loteId) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/trazabilidad/${encodeURIComponent(loteId)}`)
      if (res.status === 404) {
        setError('Lote no encontrado. Verifica el código e intenta de nuevo.')
        return
      }
      if (!res.ok) throw new Error('Error al buscar el lote')
      router.push(`/trazabilidad/${encodeURIComponent(loteId)}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const ejemplos = ['GT-FRA-6570', 'GT-RAI-1448', 'GT-HUE-5314']

  return (
    <div className="page fade-in">
      <div style={{ maxWidth: 520, margin: '40px auto', textAlign: 'center' }}>
        <Search size={52} color="var(--text-pale)" style={{ marginBottom: 16 }} />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, color: 'var(--text-dark)', marginBottom: 8 }}>
          Traza tu café
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: 24 }}>
          Ingresa el código de lote para ver la cadena completa:<br />
          cafetería → tostador → transporte → beneficio → finca → productor
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input
            className="trace-input"
            placeholder="Código de lote (ej. GT-FRA-6570)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button className="btn btn-fill" type="submit" disabled={loading}>
            {loading ? '…' : 'Buscar'}
          </button>
        </form>

        {error && (
          <div className="error-state" style={{ display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left', marginBottom: 16 }}>
            <AlertTriangle size={14} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 10 }}>
          Ejemplos de lotes:
        </div>
        <div className="chips-row" style={{ justifyContent: 'center' }}>
          {ejemplos.map((e) => (
            <button
              key={e}
              className="chip"
              onClick={() => router.push(`/trazabilidad/${e}`)}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
