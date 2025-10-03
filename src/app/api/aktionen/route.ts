import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const where: any = {};
    if (status) where.status = status;

    const aktionen = await prisma.aktion.findMany({
      where,
      orderBy: {
        startdatum: 'desc',
      },
    });

    return NextResponse.json(aktionen);
  } catch (error) {
    console.error('GET aktionen error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Aktionen' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { titel, startdatum, enddatum, beschreibung, status } = body;

    if (!titel || !startdatum || !enddatum) {
      return NextResponse.json(
        { error: 'Pflichtfelder fehlen' },
        { status: 400 }
      );
    }

    const aktion = await prisma.aktion.create({
      data: {
        titel,
        startdatum: new Date(startdatum),
        enddatum: new Date(enddatum),
        beschreibung,
        status: status || 'aktiv',
      },
    });

    return NextResponse.json(aktion, { status: 201 });
  } catch (error) {
    console.error('POST aktion error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Aktion' },
      { status: 500 }
    );
  }
}
