'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Button, Alert, Spinner } from '../ui'
import AbrechnungsTable from './AbrechnungsTable'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [abrechnungen, setAbrechnungen] = useState<any[]>([])
  const [selectedAktion, setSelectedAktion] = useState<string>('')
  const [aktionen, setAktionen] = useState<any[]>([])
  const [stats, setStats] = useState({
    gesamt: 0,
    entwuerfe: 0,
    eingereicht: 0,
    versendet: 0,
    gesamtbetrag: 0,
  })

  useEffect(() => {
    loadData()
  }, [selectedAktion])

  async function loadData() {
    try {
      setLoading(true)
      
      // Abrechnungen laden
      const url = selectedAktion
        ? `/api/abrechnung?aktionId=${selectedAktion}`
        : '/api/abrechnung'
      
      const res = await fetch(url)
      if (!res.ok) throw new Error('Fehler beim Laden')
      
      const data = await res.json()
      setAbrechnungen(data.data)
      
      // Statistiken berechnen
      const gesamt = data.data.length
      const entwuerfe = data.data.filter((a: any) => a.status === 'ENTWURF').length
      const eingereicht = data.data.filter((a: any) => a.status === 'EINGEREICHT').length
      const versendet = data.data.filter((a: any) => a.status === 'VERSENDET').length
      const gesamtbetrag = data.data.reduce((sum: number, a: any) => sum + Number(a.betrag), 0)
      
      setStats({
        gesamt,
        entwuerfe,
        eingereicht,
        versendet,
        gesamtbetrag,
      })
      
      // Unique Aktionen extrahieren
      const uniqueAktionen = Array.from(
        new Map(data.data.map((item: any) => [item.aktion.id, item.aktion])).values()
      )
      setAktionen(uniqueAktionen as any[])
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGeneratePDF() {
    if (!selectedAktion) {
      setError('Bitte wähle eine Aktion aus')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      // PDF generieren
      const pdfRes = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aktionId: selectedAktion }),
      })

      if (!pdfRes.ok) {
        const data = await pdfRes.json()
        throw new Error(data.error || 'Fehler beim Erstellen der PDF')
      }

      const pdfData = await pdfRes.json()

      // Email versenden
      const emailRes = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aktionId: selectedAktion,
          pdfUrl: pdfData.data.pdfUrl,
          metadata: pdfData.data.metadata,
        }),
      })

      if (!emailRes.ok) {
        throw new Error('PDF erstellt, aber Email konnte nicht versendet werden')
      }

      setSuccess('✅ PDF erstellt und per Email versendet!')
      
      // Daten neu laden
      loadData()

      // Success-Message nach 5 Sekunden ausblenden
      setTimeout(() => setSuccess(''), 5000)
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDownloadPDF() {
    if (!selectedAktion) {
      setError('Bitte wähle eine Aktion aus')
      return
    }

    try {
      setLoading(true)
      
      window.open(`/api/pdf?aktionId=${selectedAktion}`, '_blank')
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <Button
          variant="secondary"
          onClick={() => router.push('/api/auth/signout')}
        >
          Abmelden
        </Button>
      </div>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Gesamt</p>
            <p className="text-2xl font-bold">{stats.gesamt}</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Entwürfe</p>
            <p className="text-2xl font-bold text-gray-600">{stats.entwuerfe}</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Eingereicht</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.eingereicht}</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Versendet</p>
            <p className="text-2xl font-bold text-green-600">{stats.versendet}</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Gesamtsumme</p>
            <p className="text-2xl font-bold text-primary-700">
              {new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
              }).format(stats.gesamtbetrag)}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Aktionen</h2>
        </CardHeader>
        <CardBody>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label htmlFor="aktion-filter" className="sr-only">
                Aktion filtern
              </label>
              <select
                id="aktion-filter"
                value={selectedAktion}
                onChange={(e) => setSelectedAktion(e.target.value)}
                className="form-input"
              >
                <option value="">Alle Aktionen</option>
                {aktionen.map((aktion) => (
                  <option key={aktion.id} value={aktion.id}>
                    {aktion.titel}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleDownloadPDF}
              disabled={!selectedAktion || loading}
              variant="secondary"
            >
              {loading ? <Spinner size="sm" /> : 'PDF Vorschau'}
            </Button>

            <Button
              onClick={handleGeneratePDF}
              disabled={!selectedAktion || loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Spinner size="sm" />
                  <span>Verarbeite...</span>
                </div>
              ) : (
                'PDF erstellen & versenden'
              )}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Abrechnungen</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <AbrechnungsTable
              abrechnungen={abrechnungen}
              onRefresh={loadData}
            />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
