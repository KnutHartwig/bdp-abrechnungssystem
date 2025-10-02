import Link from 'next/link'
import { Card, CardHeader, CardBody, Button } from '@/components/ui'

export default function Home() {
  return (
    <div className="container-custom py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          BdP Abrechnungssystem
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Automatisiertes System zur Erfassung und Verwaltung von Abrechnungen
          für den BdP Landesverband Baden-Württemberg
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-primary-700">
              Für Teilnehmende
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Einfache Eingabe über Web-Formular</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Keine Anmeldung erforderlich</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Automatische Fahrtkosten-Berechnung</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Belege direkt hochladen (PDF, JPG, PNG)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Sofortige Bestätigung nach Einreichung</span>
              </li>
            </ul>
            
            <div className="pt-4">
              <Link href="/abrechnung">
                <Button size="lg" className="w-full">
                  Abrechnung einreichen →
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-primary-700">
              Für Admins
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Zentrale Übersicht aller Abrechnungen</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Filterung nach Aktion und Status</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Automatische PDF-Erstellung</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>E-Mail-Versand an Landeskasse</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Vollständige Dokumentation mit Belegen</span>
              </li>
            </ul>
            
            <div className="pt-4">
              <Link href="/admin">
                <Button size="lg" variant="secondary" className="w-full">
                  Zum Admin-Bereich →
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardBody>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Hinweise zur Nutzung
              </h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Alle Beträge bitte in Euro mit maximal 2 Nachkommastellen angeben</li>
                <li>• Bei Fahrtkosten werden die Beträge automatisch berechnet</li>
                <li>• Belege sind optional, werden aber empfohlen</li>
                <li>• Maximale Dateigröße für Belege: 5 MB</li>
                <li>• Bei Fragen wenden Sie sich an: kasse@bdp-bawue.de</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Kategorien-Übersicht */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Unterstützte Kategorien
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'Teilnahmebeiträge',
            'Fahrtkosten',
            'Unterkunft',
            'Verpflegung',
            'Material',
            'Porto',
            'Telekommunikation',
            'Honorare',
            'Raummiete',
            'Versicherungen',
            'Sonstige Ausgaben',
          ].map((kategorie) => (
            <div
              key={kategorie}
              className="bg-white border border-gray-200 rounded-lg p-4 text-center"
            >
              <p className="text-sm font-medium text-gray-700">{kategorie}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
