'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Abrechnung {
  id: string;
  name: string;
  stamm: string;
  email: string;
  betrag: number;
  belegdatum: string;
  status: string;
  createdAt: string;
  aktion: {
    titel: string;
  };
  kategorie: {
    name: string;
  };
  belegUrl?: string;
}

interface Aktion {
  id: string;
  titel: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [abrechnungen, setAbrechnungen] = useState<Abrechnung[]>([]);
  const [aktionen, setAktionen] = useState<Aktion[]>([]);
  const [selectedAktion, setSelectedAktion] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function loadData() {
      try {
        const [abrechnungenRes, aktionenRes] = await Promise.all([
          fetch('/api/abrechnung'),
          fetch('/api/aktionen'),
        ]);

        const abrechnungenData = await abrechnungenRes.json();
        const aktionenData = await aktionenRes.json();

        setAbrechnungen(abrechnungenData);
        setAktionen(aktionenData);
      } catch (err) {
        console.error('Fehler beim Laden der Daten:', err);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      loadData();
    }
  }, [status]);

  const filteredAbrechnungen = selectedAktion
    ? abrechnungen.filter(a => a.aktion.titel === selectedAktion)
    : abrechnungen;

  const stats = {
    gesamt: filteredAbrechnungen.length,
    entwurf: filteredAbrechnungen.filter(a => a.status === 'entwurf').length,
    eingereicht: filteredAbrechnungen.filter(a => a.status === 'eingereicht').length,
    versendet: filteredAbrechnungen.filter(a => a.status === 'versendet').length,
    summe: filteredAbrechnungen.reduce((sum, a) => sum + a.betrag, 0),
  };

  if (status === 'loading' || loading) {
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bdp-header rounded-lg mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="opacity-90 mt-1">
              Angemeldet als: {session.user?.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" className="bg-white text-bdp-blue">
                Startseite
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Abmelden
            </Button>
          </div>
        </div>

        {/* Statistiken */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <div className="bdp-card text-center">
            <div className="text-3xl font-bold text-bdp-blue">{stats.gesamt}</div>
            <div className="text-sm text-gray-600">Gesamt</div>
          </div>
          <div className="bdp-card text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.entwurf}</div>
            <div className="text-sm text-gray-600">Entwurf</div>
          </div>
          <div className="bdp-card text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.eingereicht}</div>
            <div className="text-sm text-gray-600">Eingereicht</div>
          </div>
          <div className="bdp-card text-center">
            <div className="text-3xl font-bold text-bdp-green">{stats.versendet}</div>
            <div className="text-sm text-gray-600">Versendet</div>
          </div>
          <div className="bdp-card text-center">
            <div className="text-2xl font-bold text-bdp-blue">{formatCurrency(stats.summe)}</div>
            <div className="text-sm text-gray-600">Gesamtsumme</div>
          </div>
        </div>

        {/* Filter und Aktionen */}
        <div className="bdp-card mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[200px]">
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedAktion}
                onChange={e => setSelectedAktion(e.target.value)}
              >
                <option value="">Alle Maßnahmen</option>
                {aktionen.map(aktion => (
                  <option key={aktion.id} value={aktion.titel}>
                    {aktion.titel}
                  </option>
                ))}
              </select>
            </div>
            <Link href="/admin/freigeben">
              <Button className="bdp-btn-secondary">
                Zur Freigabe →
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabelle */}
        <div className="bdp-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Datum</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Stamm</th>
                <th className="text-left p-3">Maßnahme</th>
                <th className="text-left p-3">Kategorie</th>
                <th className="text-right p-3">Betrag</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Beleg</th>
              </tr>
            </thead>
            <tbody>
              {filteredAbrechnungen.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-gray-500">
                    Keine Abrechnungen gefunden
                  </td>
                </tr>
              ) : (
                filteredAbrechnungen.map(abrechnung => (
                  <tr key={abrechnung.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{formatDate(new Date(abrechnung.belegdatum))}</td>
                    <td className="p-3">{abrechnung.name}</td>
                    <td className="p-3">{abrechnung.stamm}</td>
                    <td className="p-3">{abrechnung.aktion.titel}</td>
                    <td className="p-3">{abrechnung.kategorie.name}</td>
                    <td className="p-3 text-right font-mono">
                      {formatCurrency(abrechnung.betrag)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        abrechnung.status === 'entwurf' ? 'bg-yellow-100 text-yellow-800' :
                        abrechnung.status === 'eingereicht' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {abrechnung.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {abrechnung.belegUrl ? (
                        <a
                          href={abrechnung.belegUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-bdp-blue hover:underline"
                        >
                          📄 Ansehen
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
