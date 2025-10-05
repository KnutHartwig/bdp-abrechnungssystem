'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KATEGORIE_LABELS, FAHRZEUGTYP_SAETZE } from '@/types';
import { Kategorie, Fahrzeugtyp } from '@prisma/client';
import { Plus, Trash2, Send } from 'lucide-react';

interface Eintrag {
  id: string;
  kategorie: Kategorie | '';
  belegbeschreibung: string;
  belegdatum: string;
  betrag: string;
  kilometer: string;
  fahrzeugtyp: Fahrzeugtyp | '';
  mitfahrer: string;
  zuschlagLagerleitung: boolean;
  zuschlagMaterial: boolean;
  zuschlagAnhaenger: boolean;
  file: File | null;
}

export default function AbrechnungPage() {
  // Persönliche Daten (werden für alle Einträge verwendet)
  const [personalData, setPersonalData] = useState({
    name: '',
    stamm: '',
    email: '',
    iban: '',
    aktionId: '',
  });

  // Liste der Einträge
  const [eintraege, setEintraege] = useState<Eintrag[]>([
    {
      id: '1',
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
      file: null,
    },
  ]);

  const [aktionen, setAktionen] = useState<any[]>([]);
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

  // Neuen Eintrag hinzufügen
  const addEintrag = () => {
    const newEintrag: Eintrag = {
      id: Date.now().toString(),
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
      file: null,
    };
    setEintraege([...eintraege, newEintrag]);
  };

  // Eintrag entfernen
  const removeEintrag = (id: string) => {
    if (eintraege.length > 1) {
      setEintraege(eintraege.filter(e => e.id !== id));
    }
  };

  // Eintrag aktualisieren
  const updateEintrag = (id: string, field: keyof Eintrag, value: any) => {
    setEintraege(eintraege.map(e => {
      if (e.id === id) {
        const updated = { ...e, [field]: value };
        
        // Automatische Berechnung bei Fahrtkosten
        if (updated.kategorie === Kategorie.FAHRTKOSTEN && updated.kilometer && updated.fahrzeugtyp) {
          const km = parseFloat(updated.kilometer);
          const basisSatz = FAHRZEUGTYP_SAETZE[updated.fahrzeugtyp as Fahrzeugtyp];
          let satz = basisSatz;
          
          if (updated.zuschlagLagerleitung) satz += 0.05;
          if (updated.zuschlagMaterial) satz += 0.05;
          if (updated.zuschlagAnhaenger) satz += 0.05;
          
          updated.betrag = (km * satz).toFixed(2);
        }
        
        return updated;
      }
      return e;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validierung
      if (!personalData.name || !personalData.stamm || !personalData.email || !personalData.iban || !personalData.aktionId) {
        throw new Error('Bitte fülle alle persönlichen Daten aus');
      }

      // Alle Einträge durchgehen und absenden
      for (const eintrag of eintraege) {
        if (!eintrag.kategorie || !eintrag.belegdatum || !eintrag.betrag) {
          throw new Error('Bitte fülle alle Pflichtfelder für jeden Eintrag aus');
        }

        let belegUrl = '';

        // Datei hochladen wenn vorhanden
        if (eintrag.file) {
          const uploadData = new FormData();
          uploadData.append('file', eintrag.file);

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
            ...personalData,
            kategorie: eintrag.kategorie,
            belegbeschreibung: eintrag.belegbeschreibung,
            belegdatum: eintrag.belegdatum,
            betrag: parseFloat(eintrag.betrag),
            kilometer: eintrag.kilometer ? parseInt(eintrag.kilometer) : null,
            fahrzeugtyp: eintrag.fahrzeugtyp || null,
            mitfahrer: parseInt(eintrag.mitfahrer),
            zuschlagLagerleitung: eintrag.zuschlagLagerleitung,
            zuschlagMaterial: eintrag.zuschlagMaterial,
            zuschlagAnhaenger: eintrag.zuschlagAnhaenger,
            belegUrl,
          }),
        });

        const result = await res.json();
        
        if (!result.success) {
          throw new Error(result.error);
        }
      }

      setSuccess(true);
      
      // Reset nur die Einträge, persönliche Daten bleiben erhalten
      setEintraege([
        {
          id: Date.now().toString(),
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
          file: null,
        },
      ]);

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Erstellen der Abrechnung');
    } finally {
      setLoading(false);
    }
  };

  const gesamtBetrag = eintraege.reduce((sum, e) => sum + (parseFloat(e.betrag) || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Neue Abrechnung erstellen</h1>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6">
          {eintraege.length > 1 
            ? `${eintraege.length} Abrechnungen erfolgreich erstellt!` 
            : 'Abrechnung erfolgreich erstellt!'
          }
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
          <p className="text-sm text-gray-600 mb-4">
            Diese Daten gelten für alle Abrechnungseinträge, die du hinzufügst.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                required
                value={personalData.name}
                onChange={e => setPersonalData({ ...personalData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stamm/Gruppe *</label>
              <Input
                required
                value={personalData.stamm}
                onChange={e => setPersonalData({ ...personalData, stamm: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">E-Mail *</label>
              <Input
                type="email"
                required
                value={personalData.email}
                onChange={e => setPersonalData({ ...personalData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">IBAN *</label>
              <Input
                required
                placeholder="DE12 3456 7890 1234 5678 90"
                value={personalData.iban}
                onChange={e => setPersonalData({ ...personalData, iban: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Aktion *</label>
              <select
                required
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                value={personalData.aktionId}
                onChange={e => setPersonalData({ ...personalData, aktionId: e.target.value })}
              >
                <option value="">Bitte wählen...</option>
                {aktionen.map(aktion => (
                  <option key={aktion.id} value={aktion.id}>
                    {aktion.titel} ({new Date(aktion.startdatum).toLocaleDateString('de-DE')})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Einträge */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Abrechnungseinträge ({eintraege.length})
            </h2>
            <div className="text-right">
              <p className="text-sm text-gray-600">Gesamtbetrag</p>
              <p className="text-2xl font-bold text-bdp-primary">
                {gesamtBetrag.toFixed(2)} €
              </p>
            </div>
          </div>

          {eintraege.map((eintrag, index) => (
            <div key={eintrag.id} className="bg-white p-6 rounded-lg border relative">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold">Eintrag {index + 1}</h3>
                {eintraege.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeEintrag(eintrag.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {/* Kategorie */}
                <div>
                  <label className="block text-sm font-medium mb-2">Kategorie *</label>
                  <select
                    required
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={eintrag.kategorie}
                    onChange={e => updateEintrag(eintrag.id, 'kategorie', e.target.value as Kategorie)}
                  >
                    <option value="">Bitte wählen...</option>
                    {Object.entries(KATEGORIE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Fahrtkosten-Felder */}
                {eintrag.kategorie === Kategorie.FAHRTKOSTEN && (
                  <div className="bg-bdp-light p-4 rounded space-y-4">
                    <h4 className="font-semibold text-sm">Fahrtkosten-Details</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Kilometer *</label>
                        <Input
                          type="number"
                          required
                          value={eintrag.kilometer}
                          onChange={e => updateEintrag(eintrag.id, 'kilometer', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Fahrzeugtyp *</label>
                        <select
                          required
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                          value={eintrag.fahrzeugtyp}
                          onChange={e => updateEintrag(eintrag.id, 'fahrzeugtyp', e.target.value as Fahrzeugtyp)}
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
                          value={eintrag.mitfahrer}
                          onChange={e => updateEintrag(eintrag.id, 'mitfahrer', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={eintrag.zuschlagLagerleitung}
                          onChange={e => updateEintrag(eintrag.id, 'zuschlagLagerleitung', e.target.checked)}
                        />
                        <span className="text-sm">Zuschlag Lagerleitung (+0.05 €/km)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={eintrag.zuschlagMaterial}
                          onChange={e => updateEintrag(eintrag.id, 'zuschlagMaterial', e.target.checked)}
                        />
                        <span className="text-sm">Zuschlag Material (+0.05 €/km)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={eintrag.zuschlagAnhaenger}
                          onChange={e => updateEintrag(eintrag.id, 'zuschlagAnhaenger', e.target.checked)}
                        />
                        <span className="text-sm">Zuschlag Anhänger (+0.05 €/km)</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Beschreibung und Datum */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Beschreibung</label>
                    <Input
                      value={eintrag.belegbeschreibung}
                      onChange={e => updateEintrag(eintrag.id, 'belegbeschreibung', e.target.value)}
                      placeholder="z.B. Tankquittung, Einkauf..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Belegdatum *</label>
                    <Input
                      type="date"
                      required
                      value={eintrag.belegdatum}
                      onChange={e => updateEintrag(eintrag.id, 'belegdatum', e.target.value)}
                    />
                  </div>
                </div>

                {/* Betrag */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Betrag in EUR *
                    {eintrag.kategorie === Kategorie.FAHRTKOSTEN && ' (wird automatisch berechnet)'}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={eintrag.betrag}
                    onChange={e => updateEintrag(eintrag.id, 'betrag', e.target.value)}
                    readOnly={eintrag.kategorie === Kategorie.FAHRTKOSTEN}
                    className={eintrag.kategorie === Kategorie.FAHRTKOSTEN ? 'bg-gray-100' : ''}
                  />
                </div>

                {/* Datei-Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Beleg hochladen (optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => updateEintrag(eintrag.id, 'file', e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                  {eintrag.file && (
                    <p className="text-sm text-gray-600 mt-1">
                      {eintrag.file.name} ({(eintrag.file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Button zum Hinzufügen weiterer Einträge */}
          <Button
            type="button"
            variant="outline"
            onClick={addEintrag}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Weiteren Eintrag hinzufügen
          </Button>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-bdp-primary hover:bg-bdp-primary/90"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading 
              ? 'Wird gesendet...' 
              : `${eintraege.length} ${eintraege.length === 1 ? 'Abrechnung' : 'Abrechnungen'} absenden`
            }
          </Button>
        </div>
      </form>
    </div>
  );
}
