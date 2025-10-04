'use client'

import { useState, useEffect } from 'react'
import type { Abrechnung, DashboardStats } from '@/types'
import { formatCurrency, KATEGORIE_LABELS, STATUS_CONFIG } from '@/lib/utils'

export function Dashboard() {
  const [abrechnungen, setAbrechnungen] = useState<Abrechnung[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/abrechnung')
      if (res.ok) {
        const data = await res.json()
        setAbrechnungen(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error('Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: Abrechnung[]) => {
    const stats: DashboardStats = {
      totalAbrechnungen: data.length,
      gesamtbetrag: data.reduce((sum, a) => sum + Number(a.betrag), 0),
      eingereicht: data.filter(a => a.status === 'EINGEREICHT').length,
      freigegeben: data.filter(a => a.status === 'FREIGEGEBEN').length,
      byKategorie: {},
      byStatus: {},
    }

    data.forEach(a => {
      stats.byKategorie[a.kategorie] = (stats.byKategorie[a.kategorie] || 0) + 1
      stats.byStatus[a.status] = (stats.byStatus[a.status] || 0) + 1
    })

    setStats(stats)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-bdp-blue"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Statistiken */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Gesamt</div>
            <div className="text-3xl font-bold text-bdp-blue">
              {stats.totalAbrechnungen}
            </div>
            <div className="text-sm text-gray-500 mt-1">Abrechnungen</div>
          </div>

          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Betrag</div>
            <div className="text-3xl font-bold text-bdp-green">
              {formatCurrency(stats.gesamtbetrag)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Gesamt</div>
          </div>

          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Eingereicht</div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.eingereicht}
            </div>
            <div className="text-sm text-gray-500 mt-1">Zu prüfen</div>
          </div>

          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Freigegeben</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.freigegeben}
            </div>
            <div className="text-sm text-gray-500 mt-1">Bereit</div>
          </div>
        </div>
      )}

      {/* Tabelle */}
      <div className="card">
        <h2 className="text-xl font-bold text-bdp-blue mb-4">
          Alle Abrechnungen
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Stamm</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Kategorie</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Betrag</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Datum</th>
              </tr>
            </thead>
            <tbody>
              {abrechnungen.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Keine Abrechnungen vorhanden
                  </td>
                </tr>
              ) : (
                abrechnungen.map((a) => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{a.name}</td>
                    <td className="py-3 px-4 text-gray-600">{a.stamm}</td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {KATEGORIE_LABELS[a.kategorie]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(Number(a.betrag))}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        a.status === 'FREIGEGEBEN' ? 'bg-green-100 text-green-800' :
                        a.status === 'EINGEREICHT' ? 'bg-blue-100 text-blue-800' :
                        a.status === 'GEPRUEFT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {STATUS_CONFIG[a.status]?.label || a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-500">
                      {new Date(a.belegdatum).toLocaleDateString('de-DE')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
