import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const aktionen = await prisma.aktion.findMany({
      where: { status: 'AKTIV' },
      orderBy: { startdatum: 'desc' },
    });
    return NextResponse.json(aktionen);
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Laden der Aktionen' }, { status: 500 });
  }
}
