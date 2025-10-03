import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generiereAbrechnungsPDF } from '@/lib/pdf-generator';
import { PDFExportData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aktionId } = body;

    if (!aktionId) {
      return NextResponse.json(
        { error: 'Aktion-ID fehlt' },
        { status: 400 }
      );
    }

    // Aktion laden
    const aktion = await prisma.aktion.findUnique({
      where: { id: aktionId },
    });

    if (!aktion) {
      return NextResponse.json(
        { error: 'Aktion nicht gefunden' },
        { status: 404 }
      );
    }

    // Abrechnungen laden (nur eingereichte oder freigegebene)
    const abrechnungen = await prisma.abrechnung.findMany({
      where: {
        aktionId,
        status: {
          in: ['eingereicht', 'versendet'],
        },
      },
      include: {
        aktion: true,
        kategorie: true,
      },
      orderBy: [
        { kategorie: { sortierung: 'asc' } },
        { belegdatum: 'asc' },
      ],
    });

    if (abrechnungen.length === 0) {
      return NextResponse.json(
        { error: 'Keine Abrechnungen zum Exportieren gefunden' },
        { status: 404 }
      );
    }

    // Gruppiere nach Kategorien
    const kategorienMap = new Map<string, typeof abrechnungen>();
    
    abrechnungen.forEach((abrechnung) => {
      const katName = abrechnung.kategorie.name;
      if (!kategorienMap.has(katName)) {
        kategorienMap.set(katName, []);
      }
      kategorienMap.get(katName)!.push(abrechnung);
    });

    // Berechne Summen
    const kategorien = Array.from(kategorienMap.entries()).map(([name, posten]) => {
      const summe = posten.reduce((acc, p) => acc + p.betrag, 0);
      return { name, posten, summe };
    });

    const gesamtsumme = kategorien.reduce((acc, k) => acc + k.summe, 0);

    // PDF-Daten zusammenstellen
    const pdfData: PDFExportData = {
      aktionId: aktion.id,
      aktionTitel: aktion.titel,
      startdatum: aktion.startdatum,
      enddatum: aktion.enddatum,
      abrechnungen,
      kategorien,
      gesamtsumme,
    };

    // PDF generieren
    const pdfPfad = await generiereAbrechnungsPDF(pdfData);

    // Export-Eintrag erstellen
    const exportEntry = await prisma.export.create({
      data: {
        aktionId: aktion.id,
        aktionTitel: aktion.titel,
        dateiname: pdfPfad.split('/').pop() || '',
        dateipfad: pdfPfad,
        anzahlPosten: abrechnungen.length,
        gesamtsumme,
      },
    });

    // Status aller Abrechnungen auf "versendet" setzen
    await prisma.abrechnung.updateMany({
      where: {
        id: {
          in: abrechnungen.map((a) => a.id),
        },
      },
      data: {
        status: 'versendet',
      },
    });

    return NextResponse.json({
      success: true,
      exportId: exportEntry.id,
      pdfUrl: `/pdfs/${exportEntry.dateiname}`,
      anzahlPosten: abrechnungen.length,
      gesamtsumme,
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der PDF-Generierung' },
      { status: 500 }
    );
  }
}

// GET - Exportierte PDFs abrufen
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const aktionId = searchParams.get('aktionId');

    const where: any = {};
    if (aktionId) where.aktionId = aktionId;

    const exports = await prisma.export.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(exports);
  } catch (error) {
    console.error('GET exports error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Exports' },
      { status: 500 }
    );
  }
}
