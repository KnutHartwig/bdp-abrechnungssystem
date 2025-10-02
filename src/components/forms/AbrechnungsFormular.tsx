'use client'

import { useState, useEffect } from 'react'
import { Input, Select, Textarea, Button, Alert, Spinner } from '../ui'
import { Fahrzeugtyp } from '@prisma/client'
import FileUpload from './FileUpload'

export default function AbrechnungsFormular() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [aktionen, setAktionen] = useState<any[]>([])
  const [kategorien, setKategorien] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    stamm: '',
    email: '',
    aktionId: '',
    kategorieId: '',
    belegbeschreibung: '',
    belegdatum: '',
    betrag: '',
    // Fahrtkosten-spezifisch
    fahrzeugtyp: '',
    streckeKm: '',
    mitfahrer: '0',
    istLagerleitung: false,
    hatMaterial: false,
    hatAnhaenger: false,
  })

  const [belegFile, setBelegFile] = useState<File | null>(null)
  const [berechneterBetrag, setBerechneterBetrag] = useState<number | null>(null)

  // Daten laden
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Aktionen laden
      const aktionenRes = await fetch('/api/abrechnung?status=AKTIV')
      if (aktionenRes.ok) {
        const data = await aktionenRes.json()
        // Unique Aktionen extrahieren
        const uniqueAktionen = Array.from(
          new Map(data.data.map((item: any) => [item.aktion.id, item.aktion])).values()
        )
        setAktionen(uniqueAktionen as any[])
      }

      // Kategorien laden (hardcoded da es feste Kategorien sind)
      setKategorien([
        { id: '1', name: 'Teilnahmebeiträge' },
        { id: '2', name: 'Fahrtkosten' },
        { id: '3', name: 'Unterkunft' },
        { id: '4', name: 'Verpflegung' },
        { id: '5', name: 'Material' },
        { id: '6', name: 'Porto' },
        { id: '7', name: 'Telekommunikation' },
        { id: '8', name: 'Honorare' },
        { id: '9', name: 'Raummiete' },
        { id: '10', name: 'Versicherungen' },
        { id: '11', name: 'Sonstige Ausgaben' },
      ])
    } catch (err) {
      console.error('Fehler beim Laden der Daten:', err)
    }
  }

  // Fahrtkosten berechnen
  useEffect(() => {
    const kategorieName = kategorien.find(k => k.id === formData.kategorieId)?.name
    
    if (kategorieName === 'Fahrtkosten' && formData.fahrzeugtyp && formData.streckeKm) {
      const km = parseFloat(formData.streckeKm)
      if (!isNaN(km)) {
        // Basis-Sätze
        const saetze: Record<string, number> = {
          PKW_SOLO: 0.30,
          PKW_MITFAHRER_1: 0.35,
          PKW_MITFAHRER_2: 0.40,
          PKW_MITFAHRER_3_PLUS: 0.50,
          MOTORRAD: 0.10,
        }
        
        let satz = saetze[formData.fahrzeugtyp] || 0.30
        
        // Zuschläge
        if (formData.istLagerleitung) satz += 0.05
        if (formData.hatMaterial) satz += 0.05
        if (formData.hatAnhaenger) satz += 0.05
        
        const betrag = Math.round(km * satz * 100) / 100
        setBerechneterBetrag(betrag)
        setFormData(prev => ({ ...prev, betrag: betrag.toString() }))
      }
    }
  }, [
    formData.fahrzeugtyp,
    formData.streckeKm,
    formData.istLagerleitung,
    formData.hatMaterial,
    formData.hatAnhaenger,
    formData.kategorieId,
    kategorien,
  ])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Beleg hochladen falls vorhanden
      let belegUrl = ''
      let belegDateiname = ''
      
      if (belegFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', belegFile)
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })
        
        if (!uploadRes.ok) {
          throw new Error('Fehler beim Hochladen des Belegs')
        }
        
        const uploadData = await uploadRes.json()
        belegUrl = uploadData.data.url
        belegDateiname = uploadData.data.filename
      }

      // Abrechnung erstellen
      const res = await fetch('/api/abrechnung', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          belegUrl,
          belegDateiname,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Erstellen der Abrechnung')
      }

      setSuccess(true)
      
      // Formular zurücksetzen
      setFormData({
        name: '',
        stamm: '',
        email: '',
        aktionId: '',
        kategorieId: '',
        belegbeschreibung: '',
        belegdatum: '',
        betrag: '',
        fahrzeugtyp: '',
        streckeKm: '',
        mitfahrer: '0',
        istLagerleitung: false,
        hatMaterial: false,
        hatAnhaenger: false,
      })
      setBelegFile(null)
      setBerechneterBetrag(null)

      // Nach 3 Sekunden Success-Message ausblenden
      setTimeout(() => setSuccess(false), 3000)
      
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const isFahrtkosten = kategorien.find(k => k.id === formData.kategorieId)?.name === 'Fahrtkosten'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <Alert variant="success">
          ✅ Abrechnung erfolgreich eingereicht!
        </Alert>
      )}

      {error && (
        <Alert variant="error">
          ❌ {error}
        </Alert>
      )}

      {/* Persönliche Daten */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Persönliche Daten</h3>
        
        <Input
          label="Vollständiger Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Max Mustermann"
        />

        <Input
          label="Stamm/Gruppe"
          name="stamm"
          value={formData.stamm}
          onChange={handleChange}
          required
          placeholder="Stamm Phönix"
        />

        <Input
          label="E-Mail-Adresse"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="max.mustermann@example.com"
        />
      </div>

      {/* Abrechnungsdetails */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Abrechnungsdetails</h3>

        <Select
          label="Aktion"
          name="aktionId"
          value={formData.aktionId}
          onChange={handleChange}
          options={aktionen.map(a => ({ value: a.id, label: a.titel }))}
          required
          placeholder="Aktion auswählen..."
        />

        <Select
          label="Kategorie"
          name="kategorieId"
          value={formData.kategorieId}
          onChange={handleChange}
          options={kategorien.map(k => ({ value: k.id, label: k.name }))}
          required
          placeholder="Kategorie auswählen..."
        />

        <Input
          label="Belegdatum"
          name="belegdatum"
          type="date"
          value={formData.belegdatum}
          onChange={handleChange}
          required
        />

        <Textarea
          label="Beschreibung"
          name="belegbeschreibung"
          value={formData.belegbeschreibung}
          onChange={handleChange}
          placeholder="z.B. Einkauf Lebensmittel für Sommerlager"
          rows={3}
        />

        {/* Fahrtkosten-spezifische Felder */}
        {isFahrtkosten && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900">Fahrtkosten-Berechnung</h4>

            <Select
              label="Fahrzeugtyp"
              name="fahrzeugtyp"
              value={formData.fahrzeugtyp}
              onChange={handleChange}
              options={[
                { value: 'PKW_SOLO', label: 'PKW Solo (0,30 €/km)' },
                { value: 'PKW_MITFAHRER_1', label: 'PKW + 1 Mitfahrer (0,35 €/km)' },
                { value: 'PKW_MITFAHRER_2', label: 'PKW + 2 Mitfahrer (0,40 €/km)' },
                { value: 'PKW_MITFAHRER_3_PLUS', label: 'PKW + 3+ Mitfahrer (0,50 €/km)' },
                { value: 'MOTORRAD', label: 'Motorrad (0,10 €/km)' },
              ]}
              required
              placeholder="Fahrzeugtyp auswählen..."
            />

            <Input
              label="Gefahrene Kilometer"
              name="streckeKm"
              type="number"
              step="0.1"
              value={formData.streckeKm}
              onChange={handleChange}
              required
              placeholder="z.B. 150"
            />

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Zuschläge (+0,05 €/km jeweils)</p>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="istLagerleitung"
                  checked={formData.istLagerleitung}
                  onChange={handleChange}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Lagerleitung</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="hatMaterial"
                  checked={formData.hatMaterial}
                  onChange={handleChange}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Materialtransport</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="hatAnhaenger"
                  checked={formData.hatAnhaenger}
                  onChange={handleChange}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Anhänger</span>
              </label>
            </div>

            {berechneterBetrag !== null && (
              <div className="p-3 bg-green-100 rounded-lg">
                <p className="text-sm font-medium text-green-900">
                  Berechneter Betrag: <span className="text-lg">{berechneterBetrag.toFixed(2)} €</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Manueller Betrag (nur wenn nicht Fahrtkosten oder keine Auto-Berechnung) */}
        {!isFahrtkosten && (
          <Input
            label="Betrag"
            name="betrag"
            type="number"
            step="0.01"
            value={formData.betrag}
            onChange={handleChange}
            required
            placeholder="z.B. 45.50"
            helper="Betrag in Euro mit maximal 2 Nachkommastellen"
          />
        )}
      </div>

      {/* Beleg-Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Beleg (optional)</h3>
        
        <FileUpload
          file={belegFile}
          onFileChange={setBelegFile}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Spinner size="sm" />
              <span>Wird eingereicht...</span>
            </div>
          ) : (
            'Abrechnung einreichen'
          )}
        </Button>
      </div>
    </form>
  )
}
