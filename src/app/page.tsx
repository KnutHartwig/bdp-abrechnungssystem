import Link from 'next/link';
import { FileText, Users, Send, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-bdp-blue-dark mb-4">
            Willkommen beim BdP Abrechnungssystem
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Einfache und schnelle Abrechnung für alle Aktionen und Maßnahmen
            des BdP Landesverbands Baden-Württemberg
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/abrechnung"
              className="bg-bdp-blue hover:bg-bdp-blue-dark text-white px-8 py-3 rounded-lg font-medium transition"
            >
              Jetzt Abrechnung einreichen
            </Link>
            <Link
              href="/admin/login"
              className="bg-white hover:bg-gray-50 text-bdp-blue border-2 border-bdp-blue px-8 py-3 rounded-lg font-medium transition"
            >
              Admin-Login
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FileText className="w-12 h-12 text-bdp-blue mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Einfache Eingabe</h3>
            <p className="text-sm text-gray-600">
              Intuitive Formulare für schnelle Abrechnungen
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Users className="w-12 h-12 text-bdp-green mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">11 Kategorien</h3>
            <p className="text-sm text-gray-600">
              Von Teilnahmebeiträgen bis Fahrtkosten
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <CheckCircle className="w-12 h-12 text-bdp-gold mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Automatische Berechnung</h3>
            <p className="text-sm text-gray-600">
              Fahrtkosten werden automatisch kalkuliert
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Send className="w-12 h-12 text-bdp-blue-dark mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Direktversand</h3>
            <p className="text-sm text-gray-600">
              PDFs werden automatisch an die Landeskasse gesendet
            </p>
          </div>
        </div>

        {/* Anleitung */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-bdp-blue-dark mb-6">
            So funktioniert's
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-bdp-blue text-white rounded-full flex items-center justify-center font-bold mr-4">
                1
              </div>
              <div>
                <h3 className="font-bold mb-1">Formular ausfüllen</h3>
                <p className="text-gray-600">
                  Gebe deine Daten ein, wähle die Aktion und Kategorie
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-bdp-blue text-white rounded-full flex items-center justify-center font-bold mr-4">
                2
              </div>
              <div>
                <h3 className="font-bold mb-1">Belege hochladen</h3>
                <p className="text-gray-600">
                  Lade optional Belege als PDF, JPG oder PNG hoch (max. 10MB)
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-bdp-blue text-white rounded-full flex items-center justify-center font-bold mr-4">
                3
              </div>
              <div>
                <h3 className="font-bold mb-1">Admin-Prüfung</h3>
                <p className="text-gray-600">
                  Deine Abrechnung wird von Admins geprüft und freigegeben
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-bdp-green text-white rounded-full flex items-center justify-center font-bold mr-4">
                4
              </div>
              <div>
                <h3 className="font-bold mb-1">Automatischer Versand</h3>
                <p className="text-gray-600">
                  Die fertige PDF wird automatisch an die Landeskasse gesendet
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kategorien-Übersicht */}
        <div className="mt-12 bg-gray-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-bdp-blue-dark mb-4">
            Verfügbare Kategorien
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Teilnahmebeiträge',
              'Fahrtkosten',
              'Unterkunft',
              'Verpflegung',
              'Material',
              'Porto',
              'Telekommunikation',
              'Sonstige Ausgaben',
              'Honorare',
              'Versicherungen',
              'Miete',
            ].map((kategorie) => (
              <div
                key={kategorie}
                className="bg-white px-4 py-2 rounded-md shadow-sm"
              >
                <CheckCircle className="w-4 h-4 text-bdp-green inline mr-2" />
                {kategorie}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
