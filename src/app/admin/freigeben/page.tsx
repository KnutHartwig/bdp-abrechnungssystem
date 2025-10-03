'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Abrechnung {
  id: string;
  name: string;
  betrag: number;
  status: string;
  aktion: { id: string; titel: string };
  kategorie: { name: string };
}

interface Aktion {
  id: string;
  titel: string;
  startdatum: string;
  enddatum: string;
}

export default function FreigebenPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [aktionen, setAktionen] = useState<Aktion[]>([]);
  const [selectedAktion, setSelectedAktion] = useState<string>('');
  const [abrechnungen, setAbrechnungen] = useState<Abrechnung[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function loadAktionen() {
      const res = await fetch('/api/aktionen?status=aktiv');
      const data = await res.json();
      setAktionen(data);
    }
    if (status === 'authenticated') {
      loadAktionen();
    }
  }, [status]);

  useEffect(() => {
    async function loadAbrechnungen() {
      if (!selectedAktion) {
        setAbrechnungen([]);
        return;
      }
      
      const res = await fetch(`/api/abrechnung?aktionId=${selectedAktion}`);
      const data = await res.json();
      
      // Nur Entwurf und Eingereicht
      const filtered = data.filter((a: Abrechnung) => 
        a.status === 'entwurf' || a.status === 'eingereicht'
      );
      
      setAbrechnungen(filtered);
      setSelectedIds(new Set(filtered.map((a: Abrechnung) => a.id)));
    }
    
    loadAbrechnungen();
  }, [selectedAktion]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleFreigeben = async () => {
    if (selectedIds.size === 0) {
      setError('Bitte wählen Sie mindestens eine Abrechnung aus');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Status auf "eingereicht" setzen
      const updatePromises = Array.from(selectedIds).map(id =>
        fetch('/api/abrechnung', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: 'eingereicht' }),
        })
      );

      await Promise.all(updatePromises);

      // PDF generieren
      const pdfRes = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aktionId: selectedAktion }),
      });

      if (!pdfRes.ok) {
        throw new Error('Fehler bei der PDF-Generierung');
      }

      const pdfData = await pdfRes.json();

      // E-Mail versenden
      const emailRes = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exportId: pdfData.exportId }),
      });

      if (!emailRes.ok) {
        throw new Error('Fehler beim E-Mail-Versand');
      }

      setSuccess(
        `Erfolgreich! ${selectedIds.size} Abrechnungen wurden freigegeben, ` +
        `PDF erstellt und per E-Mail versendet.`
      );
      
      // Neu laden
      setSelectedAktion('');
      setAbrechnungen([]);
      setSelectedIds(new Set());
      
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const selectedAbrechnungen = abrechnungen.filter(a => selectedIds.has(a.id));
  const gesamtsumme = selectedAbrechnungen.reduce((sum, a) => sum + a.betrag, 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bdp-header rounded-lg mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Abrechnungen freigeben</h1>
            <p className="opacity-90 mt-1">
              Wählen Sie Abrechnungen aus und erstellen Sie ein PDF
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline" className="bg-white text-bdp-blue">
              ← Zurück
            </Button>
          </Link>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Aktion auswählen */}
        <div className="bdp-card mb-6">
          <h2 className="text-xl font-semibold text-bdp-blue mb-4">1. Maßnahme wählen</h2>
          <select
            className="w-full max-w-md h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedAktion}
            onChange={e => setSelectedAktion(e.target.value)}
          >
            <option value="">Bitte wählen...</option>
            {aktionen.map(aktion => (
              <option key={aktion.id} value={aktion.id}>
                {aktion.titel} ({formatDate(new Date(aktion.startdatum))} - {formatDate(new Date(aktion.enddatum))})
              </option>
            ))}
          </select>
        </div>

        {/* Abrechnungen */}
        {selectedAktion && (
          <>
            <div className="bdp-card mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-bdp-blue">
                  2. Abrechnungen auswählen
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedIds(new Set(abrechnungen.map(a => a.id)))}
                  >
                    Alle auswählen
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedIds(new Set())}
                  >
                    Keine auswählen
                  </Button>
                </div>
              </div>

              {abrechnungen.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Keine offenen Abrechnungen für diese Maßnahme
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-3 w-12">
                          <input
                            type="checkbox"
                            checked={selectedIds.size === abrechnungen.length}
                            onChange={() => {
                              if (selectedIds.size === abrechnungen.length) {
                                setSelectedIds(new Set());
                              } else {
                                setSelectedIds(new Set(abrechnungen.map(a => a.id)));
                              }
                            }}
                          />
                        </th>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Kategorie</th>
                        <th className="text-right p-3">Betrag</th>
                        <th className="text-center p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {abrechnungen.map(abrechnung => (
                        <tr key={abrechnung.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(abrechnung.id)}
                              onChange={() => toggleSelection(abrechnung.id)}
                            />
                          </td>
                          <td className="p-3">{abrechnung.name}</td>
                          <td className="p-3">{abrechnung.kategorie.name}</td>
                          <td className="p-3 text-right font-mono">
                            {formatCurrency(abrechnung.betrag)}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              abrechnung.status === 'entwurf'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {abrechnung.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Zusammenfassung */}
            {selectedIds.size > 0 && (
              <div className="bdp-card mb-6 bg-blue-50 border border-blue-200">
                <h2 className="text-xl font-semibold text-bdp-blue mb-4">
                  3. Zusammenfassung und Freigabe
                </h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-600">Ausgewählte Posten</div>
                    <div className="text-2xl font-bold text-bdp-blue">
                      {selectedIds.size}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Gesamtsumme</div>
                    <div className="text-2xl font-bold text-bdp-blue">
                      {formatCurrency(gesamtsumme)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Empfänger</div>
                    <div className="text-lg font-semibold">
                      {process.env.NEXT_PUBLIC_EMAIL_TO || 'kasse@bdp-bawue.de'}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleFreigeben}
                  disabled={loading || selectedIds.size === 0}
                  className="w-full bdp-btn-primary text-lg py-6"
                >
                  {loading
                    ? 'Verarbeitung läuft...'
                    : `${selectedIds.size} Abrechnungen freigeben und versenden`}
                </Button>

                <p className="text-xs text-gray-600 mt-3 text-center">
                  Die Abrechnungen werden als PDF exportiert und per E-Mail an die Landeskasse versendet.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
