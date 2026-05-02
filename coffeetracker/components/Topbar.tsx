'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface TopbarProps {
  title: string
  subtitle: string
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="topbar">
      <div style={{ flex: 1 }}>
        <div className="topbar-title">{title}</div>
        <div className="topbar-sub">{subtitle}</div>
      </div>
      <form className="search" onSubmit={handleSearch}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: 'var(--text-pale)', flexShrink: 0 }}>
          <circle cx="6" cy="6" r="4" />
          <line x1="9.5" y1="9.5" x2="13" y2="13" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cafetería, finca, región…"
        />
      </form>
    </div>
  )
}
