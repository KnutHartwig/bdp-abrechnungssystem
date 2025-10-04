import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, CheckCircle, Mail } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 text-bdp-primary">
          BdP Abrechnungssystem
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Automatisiertes System zur Erfassung, Verwaltung und Abrechnung von Maßnahmen 
          für den BdP Landesverband Baden-Württemberg
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/abrechnung">
            <Button size="lg" className="bg-bdp-primary hover:bg-bdp-primary/90">
              Neue Abrechnung erstellen <ArrowRight className="ml-2" />
            </Button>
          </Link>
          <Link href="/admin">
            <Button size="lg" variant="outline">
              Admin-Bereich
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6 border rounded-lg">
          <FileText className="w-12 h-12 mx-auto mb-4 text-bdp-primary" />
          <h3 className="text-xl font-semibold mb-2">Einfache Erfassung</h3>
          <p className="text-gray-600">
            Webformular ohne Anmeldung für Teilnehmende. Alle 11 Kategorien aus der Excel-Vorlage verfügbar.
          </p>
        </div>
        <div className="text-center p-6 border rounded-lg">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-bdp-primary" />
          <h3 className="text-xl font-semibold mb-2">Automatische Berechnung</h3>
          <p className="text-gray-600">
            Fahrtkosten werden automatisch berechnet (PKW: 0.30€, Transporter: 0.40€, Bus: 0.50€) inkl. Zuschläge.
          </p>
        </div>
        <div className="text-center p-6 border rounded-lg">
          <Mail className="w-12 h-12 mx-auto mb-4 text-bdp-primary" />
          <h3 className="text-xl font-semibold mb-2">PDF & E-Mail</h3>
          <p className="text-gray-600">
            Automatische PDF-Generierung und direkter Versand an die Landeskasse per E-Mail.
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-bdp-light p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">So funktioniert's</h2>
        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="bg-bdp-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
            <span>Teilnehmende erstellen Abrechnungen über das öffentliche Formular</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-bdp-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
            <span>Admins prüfen und geben Abrechnungen im Admin-Bereich frei</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-bdp-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</span>
            <span>System generiert PDF mit allen Belegen und versendet an Landeskasse</span>
          </li>
        </ol>
      </div>

      {/* Tech Stack */}
      <div className="mt-16 text-center">
        <h3 className="text-xl font-semibold mb-4">Technologie</h3>
        <p className="text-gray-600">
          Next.js 15 • React 19 • PostgreSQL • Prisma • NextAuth.js • Tailwind CSS • Puppeteer
        </p>
      </div>
    </div>
  );
}
