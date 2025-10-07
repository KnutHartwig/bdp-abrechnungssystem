import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Alle Aktionen
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const aktionen = await prisma.aktion.findMany({
      where,
      include: {
        _count: {
          select: {
            abrechnungen: true,
          },
        },
      },
      orderBy: {
        startdatum: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: aktionen });
  } catch (error) {
    console.error('Fehler beim Laden der Aktionen:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Laden der Aktionen' },
      { status: 500 }
    );
  }
}

// POST - Neue Aktion erstellen
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { titel, beschreibung, startdatum, enddatum, status } = body;

    if (!titel || !startdatum || !enddatum) {
      return NextResponse.json(
        { success: false, error: 'Titel, Startdatum und Enddatum sind erforderlich' },
        { status: 400 }
      );
    }

    const aktion = await prisma.aktion.create({
      data: {
        titel,
        beschreibung: beschreibung || null,
        startdatum: new Date(startdatum),
        enddatum: new Date(enddatum),
        status: status || 'AKTIV',
      },
    });

    return NextResponse.json({ success: true, data: aktion });
  } catch (error) {
    console.error('Fehler beim Erstellen der Aktion:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Erstellen der Aktion' },
      { status: 500 }
    );
  }
}

// PUT - Aktion aktualisieren
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID fehlt' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { titel, beschreibung, startdatum, enddatum, status } = body;

    const aktion = await prisma.aktion.update({
      where: { id },
      data: {
        titel,
        beschreibung: beschreibung || null,
        startdatum: new Date(startdatum),
        enddatum: new Date(enddatum),
        status,
      },
    });

    return NextResponse.json({ success: true, data: aktion });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Aktion:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Aktualisieren der Aktion' },
      { status: 500 }
    );
  }
}

// DELETE - Aktion löschen
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID fehlt' },
        { status: 400 }
      );
    }

    await prisma.aktion.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Aktion gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der Aktion:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Löschen der Aktion' },
      { status: 500 }
    );
  }
}
