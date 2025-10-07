import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const aktionId = searchParams.get('aktionId');
    const status = searchParams.get('status');

    const where: any = {};
    if (aktionId) where.aktionId = aktionId;
    if (status) where.status = status;

    const abrechnungen = await prisma.abrechnung.findMany({
      where,
      include: {
        aktion: {
          include: {
            admin: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(abrechnungen);
  } catch (error) {
    console.error('Error fetching abrechnungen:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Abrechnungen' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.name || !body.aktionId || !body.kategorie || !body.betrag) {
      return NextResponse.json(
        { error: 'Pflichtfelder fehlen' },
        { status: 400 }
      );
    }

    // Create abrechnung
    const abrechnung = await prisma.abrechnung.create({
      data: {
        aktionId: body.aktionId,
        name: body.name,
        stammGruppe: body.stammGruppe,
        email: body.email,
        kategorie: body.kategorie,
        betrag: parseFloat(body.betrag),
        beschreibung: body.beschreibung || null,
        belegdatum: new Date(body.belegdatum),
        belegUrl: body.belegUrl || null,
        fahrzeugtyp: body.fahrzeugtyp || null,
        anzahlMitfahrer: body.anzahlMitfahrer ? parseInt(body.anzahlMitfahrer) : null,
        kilometerstand: body.kilometerstand ? parseFloat(body.kilometerstand) : null,
        zuschlaege: body.zuschlaege || [],
        status: 'ENTWURF',
      },
      include: {
        aktion: true,
      },
    });

    return NextResponse.json(abrechnung, { status: 201 });
  } catch (error) {
    console.error('Error creating abrechnung:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Abrechnung' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID fehlt' }, { status: 400 });
    }

    const abrechnung = await prisma.abrechnung.update({
      where: { id },
      data: {
        ...data,
        betrag: data.betrag ? parseFloat(data.betrag) : undefined,
        anzahlMitfahrer: data.anzahlMitfahrer
          ? parseInt(data.anzahlMitfahrer)
          : undefined,
        kilometerstand: data.kilometerstand
          ? parseFloat(data.kilometerstand)
          : undefined,
      },
    });

    return NextResponse.json(abrechnung);
  } catch (error) {
    console.error('Error updating abrechnung:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Abrechnung' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID fehlt' }, { status: 400 });
    }

    await prisma.abrechnung.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting abrechnung:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Abrechnung' },
      { status: 500 }
    );
  }
}
