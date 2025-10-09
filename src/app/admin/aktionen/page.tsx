'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';

export default function AktionenPage() {
  const [aktionen, setAktionen] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titel: '',
    beschreibung: '',
    startdatum: '',
    enddatum: '',
    status: 'AKTIV',
  });

  useEffect(() => {
    loadAktionen();
  }, []);

  const loadAktionen = async () => {
    try {
      const res = await fetch('/api/aktionen');
      const data = await res.json();
      if (data.success) {
        setAktionen(data.data);
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editId ? `/api/aktionen?id=${editId}` : '/api/aktionen';
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (data.success) {
        alert(editId ? 'Aktion aktualisiert!' : 'Aktion erstellt!');
        setShowForm(false);
        setEditId(null);
        setFormData({
          titel: '',
          beschreibung: '',
          startdatum: '',
          enddatum: '',
          status: 'AKTIV',
        });
        loadAktionen();
      } else {
        alert('Fehler: ' + data.error);
      }
    } catch (error) {
      alert('Fehler beim Speichern');
    }
  };

  const handleEdit = (aktion: any) => {
    setEditId(aktion.id);
    setFormData({
      titel: aktion.titel,
      beschreibung: aktion.beschreibung || '',
      startdatum: aktion.startdatum.split('T')[0],
      enddatum: aktion.enddatum.split('T')[0],
      status: aktion.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Aktion wirklich löschen?')) return;
    
    try {
      const res = await fetch(`/api/aktionen?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      
      if (data.success) {
        alert('Aktion gelöscht!');
        loadAktionen();
      } else {
        alert('Fehler: ' + data.error);
      }
    } catch (error) {
      alert('Fehler beim Löschen');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({
      titel: '',
      beschreibung: '',
      startdatum: '',
      enddatum: '',
      status: 'AKTIV',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Aktionen verwalten</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Abbrechen' : 'Neue Aktion'}
        </Button>
      </div>

      {/* Formular */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editId ? 'Aktion bearbeiten' : 'Neue Aktion erstellen'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titel *</label>
              <Input
                required
                value={formData.titel}
                onChange={e => setFormData({ ...formData, titel: e.target.value })}
                placeholder="z.B. Sommerlager 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Beschreibung</label>
              <textarea
                className="w-full h-20 rounded-md border border-input bg-background px-3 py-2"
                value={formData.beschreibung}
                onChange={e => setFormData({ ...formData, beschreibung: e.target.value })}
                placeholder="Optionale Beschreibung..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Startdatum *</label>
                <Input
                  type="date"
                  required
                  value={formData.startdatum}
                  onChange={e => setFormData({ ...formData, startdatum: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Enddatum *</label>
                <Input
                  type="date"
                  required
                  value={formData.enddatum}
                  onChange={e => setFormData({ ...formData, enddatum: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="AKTIV">Aktiv</option>
                <option value="INAKTIV">Inaktiv</option>
                <option value="ABGESCHLOSSEN">Abgeschlossen</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editId ? 'Speichern' : 'Erstellen'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Abbrechen
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Titel</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Zeitraum</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Abrechnungen</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {aktionen.map(aktion => (
              <tr key={aktion.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{aktion.titel}</div>
                  {aktion.beschreibung && (
                    <div className="text-sm text-gray-500">{aktion.beschreibung}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {formatDate(aktion.startdatum)} - {formatDate(aktion.enddatum)}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    aktion.status === 'AKTIV' ? 'bg-green-100 text-green-800' :
                    aktion.status === 'INAKTIV' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {aktion.status === 'AKTIV' ? 'Aktiv' :
                     aktion.status === 'INAKTIV' ? 'Inaktiv' :
                     'Abgeschlossen'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {aktion._count?.abrechnungen || 0} Einträge
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(aktion)}>
                      Bearbeiten
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(aktion.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Löschen
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {aktionen.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Noch keine Aktionen vorhanden. Erstelle deine erste Aktion!
          </div>
        )}
      </div>
    </div>
  );
}
