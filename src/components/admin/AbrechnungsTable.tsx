'use client'

import { useState } from 'react'
import { Badge, Button } from '../ui'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AbrechnungsTable({
  abrechnungen,
  onRefresh,
}: {
  abrechnungen: any[]
  onRefresh: () => void
}) {
  const [filter, setFilter] = useState('')

  const filteredAbrechnungen = abrechnungen.filter((a) => {
    if (!filter) return true
    
    const searchTerm = filter.toLowerCase()
    return (
      a.name.toLowerCase().includes(searchTerm) ||
      a.stamm.toLowerCase().includes(searchTerm) ||
      a.email.toLowerCase().includes(searchTerm) ||
      a.kategorie.name.toLowerCase().includes(searchTerm)
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ENTWURF':
        return <Badge variant="gray">Entwurf</Badge>
      case 'EINGEREICHT':
        return <Badge variant="warning">Eingereicht</Badge>
      case 'VERSENDET':
        return <Badge variant="success">Versendet</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (abrechnungen.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Keine Abrechnungen vorhanden</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Suchen nach Name, Stamm, Email oder Kategorie..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-input max-w-md"
        />
        
        <div className="text-sm text-gray-500">
          {filteredAbrechnungen.length} von {abrechnungen.length} Einträgen
        </div>
      </div>

      {/* Tabelle */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Name</th>
              <th>Stamm</th>
              <th>Aktion</th>
              <th>Kategorie</th>
              <th>Beschreibung</th>
              <th className="text-right">Betrag</th>
              <th>Status</th>
              <th>Beleg</th>
            </tr>
          </thead>
          <tbody>
            {filteredAbrechnungen.map((abrechnung) => (
              <tr key={abrechnung.id}>
                <td className="whitespace-nowrap">
                  {formatDate(abrechnung.belegdatum)}
                </td>
                <td className="font-medium">{abrechnung.name}</td>
                <td>{abrechnung.stamm}</td>
                <td>{abrechnung.aktion.titel}</td>
                <td>{abrechnung.kategorie.name}</td>
                <td className="max-w-xs truncate">
                  {abrechnung.belegbeschreibung || '-'}
                </td>
                <td className="text-right font-medium">
                  {formatCurrency(abrechnung.betrag)}
                </td>
                <td>{getStatusBadge(abrechnung.status)}</td>
                <td>
                  {abrechnung.belegUrl ? (
                    <a
                      href={abrechnung.belegUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-700 hover:text-primary-800 text-sm"
                    >
                      Ansehen
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
