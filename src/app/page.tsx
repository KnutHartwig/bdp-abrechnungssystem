import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="bdp-header rounded-lg mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">BdP Abrechnungssystem</h1>
          <p className="text-lg opacity-90">
            Landesverband Baden-Württemberg e.V.
          </p>
        </div>

        {/* Hauptinhalt */}
        <div className="max-w-4xl mx-auto">
          <div className="bdp-card mb-8">
            <h2 className="text-2xl font-bold mb-4 text-bdp-blue">
              Willkommen beim Abrechnungssystem
            </h2>
            <p className="text-gray-700 mb-6">
              Mit diesem System können Sie Ihre Abrechnungen für BdP-Maßnahmen einfach 
              und digital einreichen. Alle Daten werden sicher gespeichert und automatisch 
              an die Landeskasse weitergeleitet.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Teilnehmende */}
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-3 text-bdp-blue">
                  Für Teilnehmende
                </h3>
                <ul className="space-y-2 mb-6 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-bdp-green mr-2">✓</span>
                    Einfache Online-Eingabe
                  </li>
                  <li className="flex items-start">
                    <span className="text-bdp-green mr-2">✓</span>
                    Belege direkt hochladen
                  </li>
                  <li className="flex items-start">
                    <span className="text-bdp-green mr-2">✓</span>
                    Automatische Fahrtkostenberechnung
                  </li>
                  <li className="flex items-start">
                    <span className="text-bdp-green mr-2">✓</span>
                    Keine Anmeldung erforderlich
                  </li>
                </ul>
                <Link href="/abrechnung">
                  <Button className="w-full bdp-btn-primary">
                    Abrechnung einreichen
                  </Button>
                </Link>
              </div>

              {/* Admins */}
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-3 text-bdp-blue">
                  Für Admins
                </h3>
                <ul className="space-y-2 mb-6 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-bdp-green mr-2">✓</span>
                    Übersicht aller Abrechnungen
                  </li>
                  <li className="flex items-start">
                    <span className="text-bdp-green mr-2">✓</span>
                    Freigabe-Workflow
                  </li>
                  <li className="flex items-start">
                    <span className="text-bdp-green mr-2">✓</span>
                    Automatische PDF-Erstellung
                  </li>
                  <li className="flex items-start">
                    <span className="text-bdp-green mr-2">✓</span>
                    E-Mail-Versand an Landeskasse
                  </li>
                </ul>
                <Link href="/admin">
                  <Button className="w-full bdp-btn-secondary" variant="secondary">
                    Zum Admin-Bereich
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Info-Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2 text-bdp-blue">
              Hinweise
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>
                • Alle Abrechnungen müssen innerhalb von 4 Wochen nach der Maßnahme eingereicht werden
              </li>
              <li>
                • Belege können als PDF, JPG oder PNG hochgeladen werden (max. 5 MB)
              </li>
              <li>
                • Bei Fahrtkosten werden die km-Sätze automatisch berechnet
              </li>
              <li>
                • Für Fragen wenden Sie sich bitte an: kasse@bdp-bawue.de
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2025 BdP Landesverband Baden-Württemberg e.V.</p>
          <p className="mt-1">Abrechnungssystem v1.0</p>
        </div>
      </footer>
    </main>
  );
}
