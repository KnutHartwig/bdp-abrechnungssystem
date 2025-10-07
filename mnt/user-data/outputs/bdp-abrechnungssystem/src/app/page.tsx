import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Users, 
  Shield, 
  Zap, 
  CheckCircle2,
  ArrowRight 
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-bdp-blue via-bdp-blue-light to-bdp-blue-dark py-20 px-4">
        <div className="bdp-pattern absolute inset-0" />
        <div className="container relative z-10 mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8 inline-block rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Automatisiert & Effizient
              </span>
            </div>
            <h1 className="mb-6 text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
              BdP Abrechnungssystem
            </h1>
            <p className="mb-8 max-w-2xl text-xl text-white/90">
              Das moderne Abrechnungssystem für den BdP Landesverband Baden-Württemberg. 
              Erfassen, verwalten und versenden Sie Abrechnungen digital und einfach.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/abrechnung">
                <Button size="lg" variant="secondary" className="gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Abrechnung einreichen
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button size="lg" variant="outline" className="gap-2 bg-white/10 text-lg text-white backdrop-blur-sm hover:bg-white/20">
                  <Shield className="h-5 w-5" />
                  Admin-Bereich
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-bdp-blue">
              Funktionen
            </h2>
            <p className="text-lg text-muted-foreground">
              Alles was Sie für eine moderne Abrechnung brauchen
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-t-4 border-t-bdp-yellow transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-bdp-yellow/10">
                  <FileText className="h-6 w-6 text-bdp-yellow" />
                </div>
                <CardTitle>Einfache Erfassung</CardTitle>
                <CardDescription>
                  Intuitive Formulare für schnelle Dateneingabe ohne Anmeldung
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-t-4 border-t-bdp-blue transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-bdp-blue/10">
                  <Zap className="h-6 w-6 text-bdp-blue" />
                </div>
                <CardTitle>Automatische Berechnung</CardTitle>
                <CardDescription>
                  Fahrtkosten werden automatisch nach aktuellen Sätzen berechnet
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-t-4 border-t-bdp-green transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-bdp-green/10">
                  <Users className="h-6 w-6 text-bdp-green" />
                </div>
                <CardTitle>Zentrale Verwaltung</CardTitle>
                <CardDescription>
                  Alle Abrechnungen an einem Ort verwalten und prüfen
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-t-4 border-t-bdp-yellow transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-bdp-yellow/10">
                  <Shield className="h-6 w-6 text-bdp-yellow" />
                </div>
                <CardTitle>Sicher & DSGVO-konform</CardTitle>
                <CardDescription>
                  Ihre Daten sind sicher und werden nach DSGVO behandelt
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-t-4 border-t-bdp-blue transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-bdp-blue/10">
                  <FileText className="h-6 w-6 text-bdp-blue" />
                </div>
                <CardTitle>PDF-Export</CardTitle>
                <CardDescription>
                  Automatische PDF-Erstellung inkl. aller Belege
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-t-4 border-t-bdp-green transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-bdp-green/10">
                  <CheckCircle2 className="h-6 w-6 text-bdp-green" />
                </div>
                <CardTitle>E-Mail-Versand</CardTitle>
                <CardDescription>
                  Direkte Übermittlung an die Landeskasse per E-Mail
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/30 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-bdp-blue">
            Bereit loszulegen?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Reichen Sie Ihre erste Abrechnung ein oder melden Sie sich als Admin an
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/abrechnung">
              <Button size="lg" className="gap-2">
                <FileText className="h-5 w-5" />
                Abrechnung einreichen
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button size="lg" variant="outline" className="gap-2">
                <Shield className="h-5 w-5" />
                Admin-Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2025 BdP Landesverband Baden-Württemberg e.V.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/datenschutz" className="hover:text-foreground">
                Datenschutz
              </Link>
              <Link href="/impressum" className="hover:text-foreground">
                Impressum
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
