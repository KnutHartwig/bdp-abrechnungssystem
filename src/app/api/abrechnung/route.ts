import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { berechneKilometer } from '@/lib/utils';

// GET - Liste aller Abrechnungen oder spezifische Aktion
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
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
        kategorie: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(abrechnungen);
  } catch (error) {
    console.error('GET /api/abrechnung error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Abrechnungen' },
      { status: 500 }
    );
  }
}

// POST - Neue Abrechnung erstellen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      stamm,
      email,
      aktionId,
      kategorieId,
      belegbeschreibung,
      belegdatum,
      betrag,
      fahrzeugtyp,
      kilometer,
      mitfahrer,
      lagerleitung,
      material,
      anhaenger,
      belegUrl,
      belegDateiname,
    } = body;

    // Validierung
    if (!name || !stamm || !email || !aktionId || !kategorieId || !belegdatum) {
      return NextResponse.json(
        { error: 'Pflichtfelder fehlen' },
        { status: 400 }
      );
    }

    // Berechne Fahrtkosten falls relevant
    let finalBetrag = betrag;
    let kmSatz = null;

    if (fahrzeugtyp && kilometer) {
      const berechnung = berechneKilometer(fahrzeugtyp, kilometer, {
        lagerleitung,
        material,
        anhaenger,
      });
      finalBetrag = berechnung.gesamtbetrag;
      kmSatz = berechnung.gesamtSatz;
    }

    const abrechnung = await prisma.abrechnung.create({
      data: {
        name,
        stamm,
        email,
        aktionId,
        kategorieId,
        belegbeschreibung,
        belegdatum: new Date(belegdatum),
        betrag: finalBetrag,
        belegUrl,
        belegDateiname,
        fahrzeugtyp,
        kilometer,
        kmSatz,
        mitfahrer,
        lagerleitung: lagerleitung || false,
        material: material || false,
        anhaenger: anhaenger || false,
        status: 'entwurf',
      },
      include: {
        aktion: true,
        kategorie: true,
      },
    });

    return NextResponse.json(abrechnung, { status: 201 });
  } catch (error) {
    console.error('POST /api/abrechnung error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Abrechnung' },
      { status: 500 }
    );
  }
}

// PATCH - Status oder Daten aktualisieren
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID fehlt' },
        { status: 400 }
      );
    }

    const abrechnung = await prisma.abrechnung.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...updateData,
      },
      include: {
        aktion: true,
        kategorie: true,
      },
    });

    return NextResponse.json(abrechnung);
  } catch (error) {
    console.error('PATCH /api/abrechnung error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Abrechnung' },
      { status: 500 }
    );
  }
}

// DELETE - Abrechnung löschen
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID fehlt' },
        { status: 400 }
      );
    }

    await prisma.abrechnung.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/abrechnung error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Abrechnung' },
      { status: 500 }
    );
  }
}
