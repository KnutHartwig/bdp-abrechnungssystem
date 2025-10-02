import { Card, CardHeader, CardBody } from '@/components/ui'
import AbrechnungsFormular from '@/components/forms/AbrechnungsFormular'

export const metadata = {
  title: 'Abrechnung einreichen | BdP Abrechnungssystem',
}

export default function AbrechnungPage() {
  return (
    <div className="container-custom py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Abrechnung einreichen
          </h1>
          <p className="text-gray-600">
            Füllen Sie das Formular aus, um Ihre Abrechnung einzureichen.
            Alle Felder mit * sind Pflichtfelder.
          </p>
        </div>

        <Card>
          <CardBody className="p-8">
            <AbrechnungsFormular />
          </CardBody>
        </Card>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-yellow-600 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Wichtige Hinweise
              </h3>
              <div className="mt-2 text-sm text-yellow-700 space-y-1">
                <p>• Bei Fahrtkosten wird der Betrag automatisch berechnet</p>
                <p>• Belege können optional hochgeladen werden (max. 5 MB)</p>
                <p>• Nach dem Absenden erhalten Sie eine Bestätigung</p>
                <p>• Bei Fragen: kasse@bdp-bawue.de</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
