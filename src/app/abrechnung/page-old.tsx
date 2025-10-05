'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KATEGORIE_LABELS, FAHRZEUGTYP_SAETZE } from '@/types';
import { Kategorie, Fahrzeugtyp } from '@prisma/client';

export default function AbrechnungPage() {
  const [formData, setFormData] = useState({
    name: '',
    stamm: '',
    email: '',
    aktionId: '',
    kategorie: '' as Kategorie | '',
    belegbeschreibung: '',
    belegdatum: '',
    betrag: '',
    kilometer: '',
    fahrzeugtyp: '' as Fahrzeugtyp | '',
    mitfahrer: '0',
    zuschlagLagerleitung: false,
    zuschlagMaterial: false,
    zuschlagAnhaenger: false,
  });

  const [aktionen, setAktionen] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Lade Aktionen
  useEffect(() => {
    fetch('/api/aktionen?status=AKTIV')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAktionen(data.data);
        }
      });
  }, []);

  // Berechne Fahrtkosten automatisch
  useEffect(() => {
    if (formData.kategorie === Kategorie.FAHRTKOSTEN && formData.kilometer && formData.fahrzeugtyp) {
      const km = parseFloat(formData.kilometer);
      const basisSatz = FAHRZEUGTYP_SAETZE[formData.fahrzeugtyp as Fahrzeugtyp];
      let satz = basisSatz;
      
      if (formData.zuschlagLagerleitung) satz += 0.05;
      if (formData.zuschlagMaterial) satz += 0.05;
      if (formData.zuschlagAnhaenger) satz += 0.05;
      
      const betrag = (km * satz).toFixed(2);
      setFormData(prev => ({ ...prev, betrag }));
    }
  }, [formData.kilometer, formData.fahrzeugtyp, formData.zuschlagLagerleitung, formData.zuschlagMaterial, formData.zuschlagAnhaenger, formData.kategorie]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let belegUrl = '';

      // Datei hochladen
      if (file) {
        const uploadData = new FormData();
        uploadData.append('file', file);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });

        const uploadResult = await uploadRes.json();
        if (!uploadResult.success) {
          throw new Error(uploadResult.error);
        }
        belegUrl = uploadResult.data.url;
      }

      // Abrechnung erstellen
      const res = await fetch('/api/abrechnung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          betrag: parseFloat(formData.betrag),
          kilometer: formData.kilometer ? parseInt(formData.kilometer) : null,
          mitfahrer: parseInt(formData.mitfahrer),
          belegUrl,
        }),
      });

      const result = await res.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        stamm: '',
        email: '',
        aktionId: '',
        kategorie: '' as Kategorie | '',
        belegbeschreibung: '',
        belegdatum: '',
        betrag: '',
        kilometer: '',
        fahrzeugtyp: '' as Fahrzeugtyp | '',
        mitfahrer: '0',
        zuschlagLagerleitung: false,
        zuschlagMaterial: false,
        zuschlagAnhaenger: false,
      });
      setFile(null);

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Erstellen der Abrechnung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Neue Abrechnung erstellen</h1>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6">
          Abrechnung erfolgreich erstellt!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Persönliche Daten */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Persönliche Daten</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stamm/Gruppe *</label>
              <Input
                required
                value={formData.stamm}
                onChange={e => setFormData({ ...formData, stamm: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">E-Mail *</label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Aktion */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Aktion</h2>
          <label className="block text-sm font-medium mb-2">Aktion *</label>
          <select
            required
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
            value={formData.aktionId}
            onChange={e => setFormData({ ...formData, aktionId: e.target.value })}
          >
            <option value="">Bitte wählen...</option>
            {aktionen.map(aktion => (
              <option key={aktion.id} value={aktion.id}>
                {aktion.titel} ({new Date(aktion.startdatum).toLocaleDateString('de-DE')})
              </option>
            ))}
          </select>
        </div>

        {/* Kategorie und Beleg */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Kategorie und Betrag</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Kategorie *</label>
              <select
                required
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                value={formData.kategorie}
                onChange={e => setFormData({ ...formData, kategorie: e.target.value as Kategorie })}
              >
                <option value="">Bitte wählen...</option>
                {Object.entries(KATEGORIE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Fahrtkosten-Felder */}
            {formData.kategorie === Kategorie.FAHRTKOSTEN && (
              <div className="bg-bdp-light p-4 rounded space-y-4">
                <h3 className="font-semibold">Fahrtkosten-Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Kilometer *</label>
                    <Input
                      type="number"
                      required
                      value={formData.kilometer}
                      onChange={e => setFormData({ ...formData, kilometer: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fahrzeugtyp *</label>
                    <select
                      required
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                      value={formData.fahrzeugtyp}
                      onChange={e => setFormData({ ...formData, fahrzeugtyp: e.target.value as Fahrzeugtyp })}
                    >
                      <option value="">Wählen...</option>
                      <option value="PKW">PKW (0.30 €/km)</option>
                      <option value="TRANSPORTER">Transporter (0.40 €/km)</option>
                      <option value="BUS">Bus (0.50 €/km)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Anzahl Mitfahrer</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.mitfahrer}
                      onChange={e => setFormData({ ...formData, mitfahrer: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.zuschlagLagerleitung}
                      onChange={e => setFormData({ ...formData, zuschlagLagerleitung: e.target.checked })}
                    />
                    <span>Zuschlag Lagerleitung (+0.05 €/km)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.zuschlagMaterial}
                      onChange={e => setFormData({ ...formData, zuschlagMaterial: e.target.checked })}
                    />
                    <span>Zuschlag Material (+0.05 €/km)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.zuschlagAnhaenger}
                      onChange={e => setFormData({ ...formData, zuschlagAnhaenger: e.target.checked })}
                    />
                    <span>Zuschlag Anhänger (+0.05 €/km)</span>
                  </label>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Belegdatum *</label>
                <Input
                  type="date"
                  required
                  value={formData.belegdatum}
                  onChange={e => setFormData({ ...formData, belegdatum: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Betrag (EUR) *</label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={formData.betrag}
                  onChange={e => setFormData({ ...formData, betrag: e.target.value })}
                  disabled={formData.kategorie === Kategorie.FAHRTKOSTEN && !!formData.kilometer && !!formData.fahrzeugtyp}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Beschreibung</label>
              <Input
                value={formData.belegbeschreibung}
                onChange={e => setFormData({ ...formData, belegbeschreibung: e.target.value })}
                placeholder="z.B. Fahrt zum Lager, Lebensmitteleinkauf, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Beleg hochladen (optional)</label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-gray-500 mt-1">PDF, JPG oder PNG, max. 5MB</p>
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Wird erstellt...' : 'Abrechnung einreichen'}
        </Button>
      </form>
    </div>
  );
}
