import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Alle aktiven Aktionen
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
