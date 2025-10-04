import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAbrechnungsPDF } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const { aktionId } = await request.json();

    if (!aktionId) {
      return NextResponse.json(
        { error: 'aktionId ist erforderlich' },
        { status: 400 }
      );
    }

    // Abrechnungen laden
    const abrechnungen = await prisma.abrechnung.findMany({
      where: {
        aktionId,
        status: { in: ['FREIGEGEBEN', 'VERSENDET'] },
      },
      include: {
        aktion: true,
      },
    });

    if (abrechnungen.length === 0) {
      return NextResponse.json(
        { error: 'Keine freigegebenen Abrechnungen gefunden' },
        { status: 404 }
      );
    }

    // PDF generieren
    const pdfBuffer = await generateAbrechnungsPDF(abrechnungen as any);

    // PDF zurückgeben
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Abrechnung_${abrechnungen[0].aktion.titel}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF Error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der PDF-Generierung' },
      { status: 500 }
    );
  }
}
