'use client'

import { useState } from 'react'
import type { ImpactoResult } from '@/types'

export default function ImpactoView() {
  const [fincaId, setFincaId] = useState('')
  const [resultados, setResultados] = useState<ImpactoResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buscado, setBuscado] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const id = fincaId.trim()
    if (!id) return
    setLoading(true)
    setError(null)
    setBuscado(false)
    try {
      const res = await fetch(`/api/impacto?finca_id=${encodeURIComponent(id)}`)
      if (!res.ok) throw new Error('Error al consultar impacto')
      const data = await res.json()
      setResultados(data)
      setBuscado(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page fade-in">
      {/* Intro */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 36 }}>⚠️</div>
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>Análisis de impacto por plaga</div>
            <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7 }}>
              Si una finca sufre una plaga o problema fitosanitario, este análisis identifica
              qué cafeterías sirven café de <strong>fincas vecinas</strong> que comparten microclima o fuente de agua,
              y por lo tanto podrían verse afectadas.
            </p>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 24, maxWidth: 520 }}>
        <input
          className="trace-input"
          placeholder="ID de la finca afectada (ej. FINCA-001)"
          value={fincaId}
          onChange={(e) => setFincaId(e.target.value)}
          disabled={loading}
        />
        <button className="btn btn-fill" type="submit" disabled={loading}>
          {loading ? '…' : 'Analizar'}
        </button>
      </form>

      {error && <div className="error-state" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

      {/* Resultados */}
      {buscado && !loading && (
        resultados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--text-dark)', marginBottom: 8 }}>
              Sin impacto detectado
            </h3>
            <p>No se encontraron fincas vecinas con microclima compartido que tengan lotes activos en cafeterías.</p>
          </div>
        ) : (
          <>
            <div className="section-title">
              {resultados.length} {resultados.length === 1 ? 'finca vecina afectada' : 'fincas vecinas afectadas'}
            </div>
            {resultados.map((r, i) => (
              <div key={i} className="impacto-result">
                <div className="impacto-finca">🌿 {r.finca_vecina}</div>
                <div style={{ fontSize: 12, color: 'var(--text-mid)' }}>
                  {r.lotes} {r.lotes === 1 ? 'lote activo' : 'lotes activos'} en cafeterías
                </div>
                <div className="impacto-cafes">
                  {r.cafeterias_afectadas.map((c, j) => (
                    <span key={j} className="metodo-tag" style={{ padding: '4px 12px', fontSize: 11.5 }}>
                      ☕ {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </>
        )
      )}
    </div>
  )
}
