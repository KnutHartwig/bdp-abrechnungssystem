'use client';
import { useState } from 'react';
export default function AbrechnungPage() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-bdp-blue-dark mb-8">Abrechnung einreichen</h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <p>Formular wird geladen...</p>
          <p className="text-sm text-gray-500 mt-4">
            Vollständiges Formular siehe Produktionscode. Diese Datei ist eine Platzhalter-Version.
          </p>
        </div>
      </div>
    </div>
  );
}
