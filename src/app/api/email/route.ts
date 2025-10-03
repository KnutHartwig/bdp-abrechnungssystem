import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendeAbrechnungEmail, sendeTestEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exportId, test } = body;

    // Test-Email
    if (test) {
      const success = await sendeTestEmail();
      return NextResponse.json({ success });
    }

    // Abrechnung versenden
    if (!exportId) {
      return NextResponse.json(
        { error: 'Export-ID fehlt' },
        { status: 400 }
      );
    }

    const exportEntry = await prisma.export.findUnique({
      where: { id: exportId },
    });

    if (!exportEntry) {
      return NextResponse.json(
        { error: 'Export nicht gefunden' },
        { status: 404 }
      );
    }

    if (exportEntry.emailVersendet) {
      return NextResponse.json(
        { error: 'E-Mail wurde bereits versendet' },
        { status: 400 }
      );
    }

    // Aktion laden für zusätzliche Daten
    const aktion = await prisma.aktion.findUnique({
      where: { id: exportEntry.aktionId },
    });

    if (!aktion) {
      return NextResponse.json(
        { error: 'Aktion nicht gefunden' },
        { status: 404 }
      );
    }

    // E-Mail versenden
    const success = await sendeAbrechnungEmail({
      aktionTitel: exportEntry.aktionTitel,
      startdatum: aktion.startdatum,
      enddatum: aktion.enddatum,
      anzahlPosten: exportEntry.anzahlPosten,
      gesamtsumme: exportEntry.gesamtsumme,
      pdfPfad: exportEntry.dateipfad,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim E-Mail-Versand' },
        { status: 500 }
      );
    }

    // Export aktualisieren
    await prisma.export.update({
      where: { id: exportId },
      data: {
        emailVersendet: true,
        emailAn: process.env.EMAIL_TO,
        versandtAm: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'E-Mail erfolgreich versendet',
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Fehler beim E-Mail-Versand' },
      { status: 500 }
    );
  }
}
