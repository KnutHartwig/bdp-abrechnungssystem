'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FAHRZEUGTYPEN, KM_SAETZE, berechneKilometer } from '@/lib/utils';
import Link from 'next/link';

interface Aktion {
  id: string;
  titel: string;
  startdatum: string;
  enddatum: string;
  status: string;
}

interface Kategorie {
  id: string;
  name: string;
}

export default function AbrechnungPage() {
  const router = useRouter();
  const [aktionen, setAktionen] = useState<Aktion[]>([]);
  const [kategorien, setKategorien] = useState<Kategorie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Formular-State
  const [formData, setFormData] = useState({
    name: '',
    stamm: '',
    email: '',
    aktionId: '',
    kategorieId: '',
    belegbeschreibung: '',
    belegdatum: '',
    betrag: '',
    
    // Fahrtkosten
    fahrzeugtyp: '',
    kilometer: '',
    mitfahrer: '0',
    lagerleitung: false,
    material: false,
    anhaenger: false,
  });
  
  const [belegFile, setBelegFile] = useState<File | null>(null);
  const [berechneterBetrag, setBerechneterBetrag] = useState<number | null>(null);

  // Daten laden
  useEffect(() => {
    async function loadData() {
      try {
        const [aktionenRes, kategorienRes] = await Promise.all([
          fetch('/api/aktionen?status=aktiv'),
          fetch('/api/kategorien'),
        ]);
        
        const aktionenData = await aktionenRes.json();
        const kategorienData = await kategorienRes.json();
        
        setAktionen(aktionenData);
        setKategorien(kategorienData);
      } catch (err) {
        setError('Fehler beim Laden der Daten');
      }
    }
    loadData();
  }, []);

  // Fahrtkosten berechnen
  useEffect(() => {
    const fahrtKategorie = kategorien.find(k => k.name === 'Fahrtkosten');
    if (formData.kategorieId === fahrtKategorie?.id && formData.fahrzeugtyp && formData.kilometer) {
      const km = parseFloat(formData.kilometer);
      if (!isNaN(km) && km > 0) {
        const berechnung = berechneKilometer(
          formData.fahrzeugtyp,
          km,
          {
            lagerleitung: formData.lagerleitung,
            material: formData.material,
            anhaenger: formData.anhaenger,
          }
        );
        setBerechneterBetrag(berechnung.gesamtbetrag);
        setFormData(prev => ({ ...prev, betrag: berechnung.gesamtbetrag.toFixed(2) }));
      }
    } else {
      setBerechneterBetrag(null);
    }
  }, [formData.fahrzeugtyp, formData.kilometer, formData.kategorieId, formData.lagerleitung, formData.material, formData.anhaenger, kategorien]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Beleg hochladen falls vorhanden
      let belegUrl = '';
      let belegDateiname = '';
      
      if (belegFile) {
        const uploadData = new FormData();
        uploadData.append('file', belegFile);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });
        
        if (!uploadRes.ok) {
          throw new Error('Fehler beim Hochladen des Belegs');
        }
        
        const uploadResult = await uploadRes.json();
        belegUrl = uploadResult.url;
        belegDateiname = uploadResult.filename;
      }

      // Abrechnung erstellen
      const abrechnungData = {
        ...formData,
        betrag: parseFloat(formData.betrag),
        kilometer: formData.kilometer ? parseFloat(formData.kilometer) : null,
        mitfahrer: parseInt(formData.mitfahrer),
        belegUrl,
        belegDateiname,
      };

      const res = await fetch('/api/abrechnung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(abrechnungData),
      });

      if (!res.ok) {
        throw new Error('Fehler beim Speichern der Abrechnung');
      }

      setSuccess(true);
      
      // Formular zurücksetzen
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const isFahrtkosten = kategorien.find(k => k.name === 'Fahrtkosten')?.id === formData.kategorieId;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bdp-card max-w-md text-center">
          <div className="text-bdp-green text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-bdp-blue mb-2">
            Abrechnung eingereicht!
          </h2>
          <p className="text-gray-700 mb-4">
            Ihre Abrechnung wurde erfolgreich gespeichert und wird von der Landeskasse bearbeitet.
          </p>
          <p className="text-sm text-gray-500">
            Sie werden in Kürze zur Startseite weitergeleitet...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="bdp-header rounded-lg mb-6">
            <h1 className="text-3xl font-bold mb-2">Abrechnung einreichen</h1>
            <p className="opacity-90">Füllen Sie das Formular aus, um Ihre Auslagen abzurechnen</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bdp-card">
            {/* Persönliche Daten */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-bdp-blue mb-4">Persönliche Daten</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Vollständiger Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="stamm">Stamm/Gruppe *</Label>
                  <Input
                    id="stamm"
                    required
                    value={formData.stamm}
                    onChange={e => setFormData({...formData, stamm: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">E-Mail-Adresse *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Aktion und Kategorie */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-bdp-blue mb-4">Maßnahme und Kategorie</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aktion">Maßnahme *</Label>
                  <select
                    id="aktion"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.aktionId}
                    onChange={e => setFormData({...formData, aktionId: e.target.value})}
                  >
                    <option value="">Bitte wählen...</option>
                    {aktionen.map(aktion => (
                      <option key={aktion.id} value={aktion.id}>
                        {aktion.titel}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="kategorie">Kategorie *</Label>
                  <select
                    id="kategorie"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.kategorieId}
                    onChange={e => setFormData({...formData, kategorieId: e.target.value})}
                  >
                    <option value="">Bitte wählen...</option>
                    {kategorien.map(kategorie => (
                      <option key={kategorie.id} value={kategorie.id}>
                        {kategorie.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Fahrtkosten-Berechnung */}
            {isFahrtkosten && (
              <div className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-bdp-blue mb-3">Fahrtkosten-Berechnung</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fahrzeugtyp">Fahrzeugtyp *</Label>
                    <select
                      id="fahrzeugtyp"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.fahrzeugtyp}
                      onChange={e => setFormData({...formData, fahrzeugtyp: e.target.value})}
                    >
                      <option value="">Bitte wählen...</option>
                      {FAHRZEUGTYPEN.map(typ => (
                        <option key={typ} value={typ}>
                          {typ} ({KM_SAETZE[typ]}€/km)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="kilometer">Kilometer *</Label>
                    <Input
                      id="kilometer"
                      type="number"
                      step="0.1"
                      required
                      value={formData.kilometer}
                      onChange={e => setFormData({...formData, kilometer: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mitfahrer">Anzahl Mitfahrer</Label>
                    <Input
                      id="mitfahrer"
                      type="number"
                      min="0"
                      value={formData.mitfahrer}
                      onChange={e => setFormData({...formData, mitfahrer: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.lagerleitung}
                      onChange={e => setFormData({...formData, lagerleitung: e.target.checked})}
                    />
                    Lagerleitung (+0,05€/km)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.material}
                      onChange={e => setFormData({...formData, material: e.target.checked})}
                    />
                    Materialtransport (+0,05€/km)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.anhaenger}
                      onChange={e => setFormData({...formData, anhaenger: e.target.checked})}
                    />
                    Anhänger (+0,05€/km)
                  </label>
                </div>

                {berechneterBetrag !== null && (
                  <div className="mt-4 p-3 bg-white rounded border border-bdp-green">
                    <strong className="text-bdp-blue">Berechneter Betrag:</strong> {berechneterBetrag.toFixed(2)}€
                  </div>
                )}
              </div>
            )}

            {/* Belegdaten */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-bdp-blue mb-4">Belegdaten</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="belegdatum">Datum *</Label>
                  <Input
                    id="belegdatum"
                    type="date"
                    required
                    value={formData.belegdatum}
                    onChange={e => setFormData({...formData, belegdatum: e.target.value})}
                  />
                </div>
                {!isFahrtkosten && (
                  <div>
                    <Label htmlFor="betrag">Betrag (EUR) *</Label>
                    <Input
                      id="betrag"
                      type="number"
                      step="0.01"
                      required
                      value={formData.betrag}
                      onChange={e => setFormData({...formData, betrag: e.target.value})}
                    />
                  </div>
                )}
                <div className="md:col-span-2">
                  <Label htmlFor="beschreibung">Beschreibung</Label>
                  <Input
                    id="beschreibung"
                    value={formData.belegbeschreibung}
                    onChange={e => setFormData({...formData, belegbeschreibung: e.target.value})}
                    placeholder="z.B. Einkauf Verpflegung, Tankquittung, ..."
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="beleg">Beleg hochladen (optional)</Label>
                  <Input
                    id="beleg"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setBelegFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, JPG oder PNG (max. 5 MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="bdp-btn-primary flex-1"
              >
                {loading ? 'Wird gespeichert...' : 'Abrechnung einreichen'}
              </Button>
              <Link href="/">
                <Button type="button" variant="outline">
                  Abbrechen
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
