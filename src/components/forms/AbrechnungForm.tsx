'use client'

import { useState } from 'react'
import { FileUpload } from './FileUpload'
import type { Aktion, Kategorie, Fahrzeugtyp } from '@/types'
import { KATEGORIE_LABELS, calculateFahrtkosten } from '@/lib/utils'

interface Props {
  aktionen: Aktion[]
}

export function AbrechnungForm({ aktionen }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    stamm: '',
    email: '',
    aktionId: '',
    kategorie: '' as Kategorie | '',
    belegbeschreibung: '',
    belegdatum: '',
    betrag: '',
    // Fahrtkosten
    kilometerstand: '',
    fahrzeugtyp: '' as Fahrzeugtyp | '',
    mitfahrer: '0',
    zuschlagLagerleitung: false,
    zuschlagMaterial: false,
    zuschlagAnhaenger: false,
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Datei hochladen (falls vorhanden)
      let belegUrl = ''
      if (file) {
        const fileFormData = new FormData()
        fileFormData.append('file', file)
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: fileFormData,
        })
        if (!uploadRes.ok) throw new Error('Datei-Upload fehlgeschlagen')
        const uploadData = await uploadRes.json()
        belegUrl = uploadData.url
      }

      // Abrechnung erstellen
      const submitData = {
        ...formData,
        betrag: formData.kategorie === 'FAHRTKOSTEN' 
          ? calculateFahrtkosten({
              kilometer: parseInt(formData.kilometerstand),
              fahrzeugtyp: formData.fahrzeugtyp as Fahrzeugtyp,
              mitfahrer: parseInt(formData.mitfahrer),
              zuschlagLagerleitung: formData.zuschlagLagerleitung,
              zuschlagMaterial: formData.zuschlagMaterial,
              zuschlagAnhaenger: formData.zuschlagAnhaenger,
            })
          : parseFloat(formData.betrag),
        belegUrl,
        belegdatum: new Date(formData.belegdatum),
        kilometerstand: formData.kilometerstand ? parseInt(formData.kilometerstand) : null,
        mitfahrer: parseInt(formData.mitfahrer),
      }

      const res = await fetch('/api/abrechnung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (!res.ok) throw new Error('Fehler beim Erstellen der Abrechnung')

      setSuccess(true)
      // Formular zurücksetzen
      setFormData({
        name: '',
        stamm: '',
        email: '',
        aktionId: '',
        kategorie: '',
        belegbeschreibung: '',
        belegdatum: '',
        betrag: '',
        kilometerstand: '',
        fahrzeugtyp: '',
        mitfahrer: '0',
        zuschlagLagerleitung: false,
        zuschlagMaterial: false,
        zuschlagAnhaenger: false,
      })
      setFile(null)
    } catch (err) {
      setError('Fehler beim Absenden. Bitte versuchen Sie es erneut.')
    } finally {
      setLoading(false)
    }
  }

  const isFahrtkosten = formData.kategorie === 'FAHRTKOSTEN'

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-bdp-green mb-2">
          Abrechnung erfolgreich eingereicht!
        </h2>
        <p className="text-gray-600 mb-6">
          Ihre Abrechnung wird geprüft und Sie erhalten eine Rückmeldung.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="btn-primary"
        >
          Weitere Abrechnung einreichen
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Persönliche Daten */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Vollständiger Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">Stamm/Gruppe *</label>
          <input
            type="text"
            value={formData.stamm}
            onChange={(e) => setFormData({ ...formData, stamm: e.target.value })}
            className="input"
            required
          />
        </div>
      </div>

      <div>
        <label className="label">E-Mail-Adresse *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="input"
          required
        />
      </div>

      {/* Aktion & Kategorie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Aktion *</label>
          <select
            value={formData.aktionId}
            onChange={(e) => setFormData({ ...formData, aktionId: e.target.value })}
            className="input"
            required
          >
            <option value="">Bitte wählen...</option>
            {aktionen.map((aktion) => (
              <option key={aktion.id} value={aktion.id}>
                {aktion.titel}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Kategorie *</label>
          <select
            value={formData.kategorie}
            onChange={(e) => setFormData({ ...formData, kategorie: e.target.value as Kategorie })}
            className="input"
            required
          >
            <option value="">Bitte wählen...</option>
            {Object.entries(KATEGORIE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fahrtkosten-spezifische Felder */}
      {isFahrtkosten && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
          <h3 className="font-medium text-bdp-blue">Fahrtkosten-Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Kilometer *</label>
              <input
                type="number"
                value={formData.kilometerstand}
                onChange={(e) => setFormData({ ...formData, kilometerstand: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Fahrzeugtyp *</label>
              <select
                value={formData.fahrzeugtyp}
                onChange={(e) => setFormData({ ...formData, fahrzeugtyp: e.target.value as Fahrzeugtyp })}
                className="input"
                required
              >
                <option value="">Wählen...</option>
                <option value="PKW">PKW (0,30 €/km)</option>
                <option value="TRANSPORTER">Transporter (0,40 €/km)</option>
                <option value="BUS">Bus (0,50 €/km)</option>
              </select>
            </div>

            <div>
              <label className="label">Mitfahrer</label>
              <input
                type="number"
                value={formData.mitfahrer}
                onChange={(e) => setFormData({ ...formData, mitfahrer: e.target.value })}
                className="input"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.zuschlagLagerleitung}
                onChange={(e) => setFormData({ ...formData, zuschlagLagerleitung: e.target.checked })}
              />
              <span className="text-sm">Zuschlag Lagerleitung (+0,05 €/km)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.zuschlagMaterial}
                onChange={(e) => setFormData({ ...formData, zuschlagMaterial: e.target.checked })}
              />
              <span className="text-sm">Zuschlag Material (+0,05 €/km)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.zuschlagAnhaenger}
                onChange={(e) => setFormData({ ...formData, zuschlagAnhaenger: e.target.checked })}
              />
              <span className="text-sm">Zuschlag Anhänger (+0,05 €/km)</span>
            </label>
          </div>
        </div>
      )}

      {/* Beleg-Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Belegdatum *</label>
          <input
            type="date"
            value={formData.belegdatum}
            onChange={(e) => setFormData({ ...formData, belegdatum: e.target.value })}
            className="input"
            required
          />
        </div>

        {!isFahrtkosten && (
          <div>
            <label className="label">Betrag (EUR) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.betrag}
              onChange={(e) => setFormData({ ...formData, betrag: e.target.value })}
              className="input"
              required
            />
          </div>
        )}
      </div>

      <div>
        <label className="label">Beschreibung</label>
        <textarea
          value={formData.belegbeschreibung}
          onChange={(e) => setFormData({ ...formData, belegbeschreibung: e.target.value })}
          className="input"
          rows={3}
        />
      </div>

      <FileUpload file={file} onFileChange={setFile} />

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary"
      >
        {loading ? 'Wird eingereicht...' : 'Abrechnung einreichen'}
      </button>
    </form>
  )
}
