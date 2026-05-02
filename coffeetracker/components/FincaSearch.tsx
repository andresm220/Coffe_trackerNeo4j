'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FincaSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const id = query.trim()
    if (id) router.push(`/finca/${encodeURIComponent(id)}`)
  }

  const ejemplos = [
    { id: 'FINCA-001', nombre: 'El Injerto' },
    { id: 'FINCA-002', nombre: 'La Esperanza' },
    { id: 'FINCA-003', nombre: 'Santa Catalina' },
  ]

  return (
    <div className="page fade-in">
      <div style={{ maxWidth: 520, margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🌿</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, color: 'var(--text-dark)', marginBottom: 8 }}>
          Vista inversa de finca
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: 24 }}>
          Dado el ID de una finca, descubre en qué cafeterías<br />
          se sirve actualmente el café que produjo.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input
            className="trace-input"
            placeholder="ID de finca (ej. FINCA-001)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-fill" type="submit">Buscar</button>
        </form>

        <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 10 }}>Ejemplos:</div>
        <div className="chips-row" style={{ justifyContent: 'center' }}>
          {ejemplos.map((f) => (
            <button
              key={f.id}
              className="chip"
              onClick={() => router.push(`/finca/${f.id}`)}
            >
              {f.nombre}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
