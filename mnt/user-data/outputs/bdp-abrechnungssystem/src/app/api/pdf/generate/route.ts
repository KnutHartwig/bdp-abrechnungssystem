import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateAbrechnungsPDF } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { aktionId } = body;

    if (!aktionId) {
      return NextResponse.json({ error: 'Aktion ID fehlt' }, { status: 400 });
    }

    // Fetch Aktion mit allen Abrechnungen
    const aktion = await prisma.aktion.findUnique({
      where: { id: aktionId },
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
        abrechnungen: {
          where: {
            status: {
              in: ['EINGEREICHT', 'ENTWURF'],
            },
          },
          orderBy: [
            { kategorie: 'asc' },
            { name: 'asc' },
          ],
        },
      },
    });

    if (!aktion) {
      return NextResponse.json({ error: 'Aktion nicht gefunden' }, { status: 404 });
    }

    if (aktion.abrechnungen.length === 0) {
      return NextResponse.json(
        { error: 'Keine Abrechnungen vorhanden' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateAbrechnungsPDF(
      {
        titel: aktion.titel,
        startdatum: aktion.startdatum,
        enddatum: aktion.enddatum,
        adminName: aktion.admin.name,
      },
      aktion.abrechnungen.map((ab) => ({
        id: ab.id,
        name: ab.name,
        stammGruppe: ab.stammGruppe,
        kategorie: ab.kategorie,
        betrag: ab.betrag,
        beschreibung: ab.beschreibung,
        belegdatum: ab.belegdatum,
        fahrzeugtyp: ab.fahrzeugtyp,
        anzahlMitfahrer: ab.anzahlMitfahrer,
        kilometerstand: ab.kilometerstand,
      }))
    );

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Abrechnung_${aktion.titel.replace(
          /\s+/g,
          '_'
        )}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Fehler beim Generieren der PDF' },
      { status: 500 }
    );
  }
}
