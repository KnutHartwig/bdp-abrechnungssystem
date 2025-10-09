import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendeAbrechnungAnLandeskasse } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { aktionId, pdfPath } = body;

    if (!aktionId || !pdfPath) {
      return NextResponse.json(
        { success: false, error: 'Fehlende Parameter' },
        { status: 400 }
      );
    }

    // Hole Aktionsdaten und berechne Gesamtbetrag
    const aktion = await prisma.aktion.findUnique({
      where: { id: aktionId },
      include: {
        abrechnungen: {
          where: {
            status: { in: ['EINGEREICHT', 'GEPRUEFT', 'FREIGEGEBEN'] },
          },
        },
      },
    });

    if (!aktion) {
      return NextResponse.json(
        { success: false, error: 'Aktion nicht gefunden' },
        { status: 404 }
      );
    }

    const gesamtBetrag = aktion.abrechnungen.reduce(
      (sum, ab) => sum + Number(ab.betrag),
      0
    );

    // E-Mail versenden
    const emailResult = await sendeAbrechnungAnLandeskasse(
      aktion.titel,
      pdfPath,
      gesamtBetrag
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: emailResult.error },
        { status: 500 }
      );
    }

    // Status auf VERSENDET setzen
    await prisma.abrechnung.updateMany({
      where: {
        aktionId,
        status: { in: ['EINGEREICHT', 'GEPRUEFT', 'FREIGEGEBEN'] },
      },
      data: {
        status: 'VERSENDET',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'E-Mail erfolgreich versendet',
    });
  } catch (error) {
    console.error('E-Mail-API-Fehler:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim E-Mail-Versand' },
      { status: 500 }
    );
  }
}
