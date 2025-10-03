import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const kategorien = await prisma.kategorie.findMany({
      where: {
        aktiv: true,
      },
      orderBy: {
        sortierung: 'asc',
      },
    });

    return NextResponse.json(kategorien);
  } catch (error) {
    console.error('GET kategorien error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Kategorien' },
      { status: 500 }
    );
  }
}
