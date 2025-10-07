'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Automatische Datenbank-Initialisierung beim ersten Laden
  useEffect(() => {
    const initDatabase = async () => {
      try {
        await fetch('/api/init');
      } catch (err) {
        console.error('Init-Fehler:', err);
      }
    };
    initDatabase();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    if (result?.error) {
      setError('Ungültige Anmeldedaten');
      setLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-bdp-primary">Admin-Login</h1>
          <p className="text-gray-600 mt-2">Melden Sie sich an, um Abrechnungen zu verwalten</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">E-Mail</label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@bdp-bawue.de"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Passwort</label>
            <Input
              type="password"
              required
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Wird angemeldet...' : 'Anmelden'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded">
          <p className="text-sm text-gray-600">
            <strong>Demo-Zugänge:</strong>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Admin: admin@bdp-bawue.de / admin123
          </p>
          <p className="text-sm text-gray-600">
            Kasse: kasse@bdp-bawue.de / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
