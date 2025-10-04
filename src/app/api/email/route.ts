import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAbrechnungsPDF } from '@/lib/pdf-generator';
import { sendAbrechnungToLandeskasse } from '@/lib/email';

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
        status: 'FREIGEGEBEN',
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

    // Statistiken berechnen
    const gesamtbetrag = abrechnungen.reduce(
      (sum, a) => sum + Number(a.betrag),
      0
    );

    // E-Mail versenden
    const success = await sendAbrechnungToLandeskasse(
      abrechnungen[0].aktion.titel,
      pdfBuffer,
      abrechnungen.length,
      gesamtbetrag
    );

    if (!success) {
      return NextResponse.json(
        { error: 'E-Mail konnte nicht versendet werden' },
        { status: 500 }
      );
    }

    // Status auf VERSENDET setzen
    await prisma.abrechnung.updateMany({
      where: {
        id: { in: abrechnungen.map((a) => a.id) },
      },
      data: {
        status: 'VERSENDET',
      },
    });

    return NextResponse.json({
      success: true,
      anzahl: abrechnungen.length,
      gesamtbetrag,
    });
  } catch (error) {
    console.error('Email Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim E-Mail-Versand' },
      { status: 500 }
    );
  }
}
