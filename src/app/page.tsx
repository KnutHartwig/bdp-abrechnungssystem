import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold mb-6 text-bdp-primary">
          BdP Abrechnungssystem
        </h1>
        
        <p className="text-xl text-gray-600 mb-12">
          Erfasse deine Abrechnungen schnell und einfach für Maßnahmen des BdP Landesverbands Baden-Württemberg
        </p>
        
        <Link href="/abrechnung">
          <Button size="lg" className="bg-bdp-primary hover:bg-bdp-primary/90 text-lg px-8 py-6 h-auto">
            Neue Abrechnung erstellen <ArrowRight className="ml-2" />
          </Button>
        </Link>
        
        <div className="mt-12 text-sm text-gray-500">
          <p className="mb-2">So funktioniert's:</p>
          <p className="leading-relaxed">
            Fülle das Formular aus, lade deine Belege hoch und sende die Abrechnung ab. 
            Die Admins prüfen deine Eingaben und die Landeskasse erhält automatisch eine vollständige PDF-Abrechnung.
          </p>
        </div>
      </div>
    </div>
  );
}
