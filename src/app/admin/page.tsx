'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { KATEGORIE_LABELS, STATUS_LABELS } from '@/types';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [abrechnungen, setAbrechnungen] = useState<any[]>([]);
  const [aktionen, setAktionen] = useState<any[]>([]);
  const [selectedAktion, setSelectedAktion] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Lade Aktionen
    fetch('/api/aktionen')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAktionen(data.data);
        }
      });
  }, []);

  useEffect(() => {
    // Lade Abrechnungen
    const url = selectedAktion 
      ? `/api/abrechnung?aktionId=${selectedAktion}` 
      : '/api/abrechnung';
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAbrechnungen(data.data);
        }
      });
  }, [selectedAktion]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/abrechnung', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        // Reload abrechnungen
        setAbrechnungen(prev =>
          prev.map(ab => ab.id === id ? { ...ab, status: newStatus } : ab)
        );
      }
    } catch (error) {
      console.error('Fehler beim Status-Update:', error);
    }
  };

  const handleGeneratePDF = async () => {
    if (!selectedAktion) {
      alert('Bitte wähle eine Aktion aus');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aktionId: selectedAktion }),
      });

      const data = await res.json();
      if (data.success) {
        // Öffne PDF in neuem Tab
        window.open(data.data.pdfUrl, '_blank');
      } else {
        alert('Fehler: ' + data.error);
      }
    } catch (error) {
      alert('Fehler bei PDF-Generierung');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedAktion) {
      alert('Bitte wähle eine Aktion aus');
      return;
    }

    setLoading(true);
    try {
      // Erst PDF generieren
      const pdfRes = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aktionId: selectedAktion }),
      });

      const pdfData = await pdfRes.json();
      if (!pdfData.success) {
        throw new Error(pdfData.error);
      }

      // Dann E-Mail senden
      const emailRes = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aktionId: selectedAktion,
          pdfPath: pdfData.data.pdfPath,
        }),
      });

      const emailData = await emailRes.json();
      if (emailData.success) {
        alert('E-Mail erfolgreich versendet!');
        // Reload data
        window.location.reload();
      } else {
        alert('Fehler beim E-Mail-Versand: ' + emailData.error);
      }
    } catch (error: any) {
      alert('Fehler: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="container mx-auto px-4 py-8">Lädt...</div>;
  }

  if (!session) {
    return null;
  }

  const gesamtBetrag = abrechnungen.reduce((sum, ab) => sum + Number(ab.betrag), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin-Dashboard</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">Angemeldet als</p>
          <p className="font-medium">{session.user.email}</p>
        </div>
      </div>

      {/* Filter und Aktionen */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Aktion filtern</label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
              value={selectedAktion}
              onChange={e => setSelectedAktion(e.target.value)}
            >
              <option value="">Alle Aktionen</option>
              {aktionen.map(aktion => (
                <option key={aktion.id} value={aktion.id}>
                  {aktion.titel} ({aktion._count.abrechnungen} Abrechnungen)
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={handleGeneratePDF} disabled={!selectedAktion || loading}>
              PDF generieren
            </Button>
            <Button onClick={handleSendEmail} disabled={!selectedAktion || loading} variant="default">
              {loading ? 'Wird versendet...' : 'PDF versenden'}
            </Button>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Gesamtbetrag</p>
            <p className="text-2xl font-bold text-bdp-primary">{formatCurrency(gesamtBetrag)}</p>
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {['ENTWURF', 'EINGEREICHT', 'GEPRUEFT', 'FREIGEGEBEN'].map(status => {
          const count = abrechnungen.filter(ab => ab.status === status).length;
          return (
            <div key={status} className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600">{STATUS_LABELS[status as keyof typeof STATUS_LABELS]}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Tabelle */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Aktion</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Kategorie</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Betrag</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Datum</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {abrechnungen.map(ab => (
                <tr key={ab.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{ab.name}</div>
                    <div className="text-sm text-gray-500">{ab.stamm}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{ab.aktion.titel}</td>
                  <td className="px-4 py-3 text-sm">
                    {KATEGORIE_LABELS[ab.kategorie as keyof typeof KATEGORIE_LABELS]}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(ab.betrag)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {STATUS_LABELS[ab.status as keyof typeof STATUS_LABELS]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{formatDate(ab.belegdatum)}</td>
                  <td className="px-4 py-3">
                    <select
                      className="text-sm border rounded px-2 py-1"
                      value={ab.status}
                      onChange={e => handleStatusUpdate(ab.id, e.target.value)}
                    >
                      <option value="ENTWURF">Entwurf</option>
                      <option value="EINGEREICHT">Eingereicht</option>
                      <option value="GEPRUEFT">Geprüft</option>
                      <option value="FREIGEGEBEN">Freigegeben</option>
                      <option value="VERSENDET">Versendet</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {abrechnungen.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Keine Abrechnungen vorhanden
          </div>
        )}
      </div>
    </div>
  );
}
