'use client'

import { Card, CardBody, CardHeader } from '../ui'

export default function PDFPreview({
  pdfUrl,
}: {
  pdfUrl: string
}) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">PDF-Vorschau</h3>
      </CardHeader>
      <CardBody>
        <div className="aspect-[3/4] w-full">
          <iframe
            src={pdfUrl}
            className="w-full h-full border border-gray-200 rounded"
            title="PDF Vorschau"
          />
        </div>
        
        <div className="mt-4 flex justify-end">
          <a
            href={pdfUrl}
            download
            className="btn btn-primary"
          >
            PDF herunterladen
          </a>
        </div>
      </CardBody>
    </Card>
  )
}
