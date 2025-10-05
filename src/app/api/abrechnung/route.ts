import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateBetrag, validateKilometer, berechneFahrtkosten } from '@/lib/utils';
import { Kategorie, Fahrzeugtyp } from '@prisma/client';

// GET - Alle Abrechnungen oder gefiltert
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const aktionId = searchParams.get('aktionId');
    const status = searchParams.get('status');

    const where: any = {};
    if (aktionId) where.aktionId = aktionId;
    if (status) where.status = status;

    const abrechnungen = await prisma.abrechnung.findMany({
      where,
      include: {
        aktion: {
          select: {
            id: true,
            titel: true,
            startdatum: true,
            enddatum: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: abrechnungen });
  } catch (error) {
    console.error('Fehler beim Laden der Abrechnungen:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Laden der Abrechnungen' },
      { status: 500 }
    );
  }
}

// POST - Neue Abrechnung erstellen
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      name,
      stamm,
      email,
      aktionId,
      kategorie,
      belegbeschreibung,
      belegdatum,
      betrag,
      belegUrl,
      kilometer,
      fahrzeugtyp,
      mitfahrer,
      zuschlagLagerleitung,
      zuschlagMaterial,
      zuschlagAnhaenger,
    } = body;

    // Validierungen
    if (!name || !stamm || !email || !aktionId || !kategorie || !belegdatum) {
      return NextResponse.json(
        { success: false, error: 'Pflichtfelder fehlen' },
        { status: 400 }
      );
    }

    // Bei Fahrtkosten: Automatische Berechnung
    let finalBetrag = betrag;
    let kmSatz = null;

    if (kategorie === Kategorie.FAHRTKOSTEN && kilometer && fahrzeugtyp) {
      const kmValidation = validateKilometer(kilometer);
      if (!kmValidation.valid) {
        return NextResponse.json(
          { success: false, error: kmValidation.error },
          { status: 400 }
        );
      }

      const berechnung = berechneFahrtkosten(
        kilometer,
        fahrzeugtyp as Fahrzeugtyp,
        zuschlagLagerleitung,
        zuschlagMaterial,
        zuschlagAnhaenger
      );

      finalBetrag = berechnung.gesamtBetrag;
      kmSatz = berechnung.gesamtSatz;
    }

    // Betrag validieren
    const betragValidation = validateBetrag(finalBetrag);
    if (!betragValidation.valid) {
      return NextResponse.json(
        { success: false, error: betragValidation.error },
        { status: 400 }
      );
    }

    // Aktion existiert?
    const aktion = await prisma.aktion.findUnique({
      where: { id: aktionId },
    });

    if (!aktion) {
      return NextResponse.json(
        { success: false, error: 'Aktion nicht gefunden' },
        { status: 404 }
      );
    }

    // Abrechnung erstellen
    const abrechnung = await prisma.abrechnung.create({
      data: {
        name,
        stamm,
        email,
        aktionId,
        kategorie,
        belegbeschreibung,
        belegdatum: new Date(belegdatum),
        betrag: finalBetrag,
        belegUrl,
        kilometer,
        fahrzeugtyp,
        kmSatz,
        mitfahrer: mitfahrer || 0,
        zuschlagLagerleitung: zuschlagLagerleitung || false,
        zuschlagMaterial: zuschlagMaterial || false,
        zuschlagAnhaenger: zuschlagAnhaenger || false,
        status: 'ENTWURF',
      },
      include: {
        aktion: true,
      },
    });

    return NextResponse.json({ success: true, data: abrechnung }, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Erstellen der Abrechnung:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Erstellen der Abrechnung' },
      { status: 500 }
    );
  }
}

// PUT - Abrechnung aktualisieren (nur für Admins)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID fehlt' }, { status: 400 });
    }

    const abrechnung = await prisma.abrechnung.update({
      where: { id },
      data: {
        ...updateData,
        status: status || updateData.status,
      },
      include: {
        aktion: true,
      },
    });

    return NextResponse.json({ success: true, data: abrechnung });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Abrechnung:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Aktualisieren der Abrechnung' },
      { status: 500 }
    );
  }
}

// DELETE - Abrechnung löschen (nur für Admins)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'LANDESKASSE') {
      return NextResponse.json({ success: false, error: 'Keine Berechtigung' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID fehlt' }, { status: 400 });
    }

    await prisma.abrechnung.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Abrechnung gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der Abrechnung:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Löschen der Abrechnung' },
      { status: 500 }
    );
  }
}
