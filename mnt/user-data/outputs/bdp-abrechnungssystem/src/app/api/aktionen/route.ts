import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) where.status = status;

    const aktionen = await prisma.aktion.findMany({
      where,
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
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

    return NextResponse.json(aktionen);
  } catch (error) {
    console.error('Error fetching aktionen:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Aktionen' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validation
    if (!body.titel || !body.startdatum || !body.enddatum) {
      return NextResponse.json(
        { error: 'Pflichtfelder fehlen' },
        { status: 400 }
      );
    }

    const aktion = await prisma.aktion.create({
      data: {
        titel: body.titel,
        startdatum: new Date(body.startdatum),
        enddatum: new Date(body.enddatum),
        status: body.status || 'AKTIV',
        adminId: (session.user as any).id,
      },
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(aktion, { status: 201 });
  } catch (error) {
    console.error('Error creating aktion:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Aktion' },
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

    const aktion = await prisma.aktion.update({
      where: { id },
      data: {
        ...data,
        startdatum: data.startdatum ? new Date(data.startdatum) : undefined,
        enddatum: data.enddatum ? new Date(data.enddatum) : undefined,
      },
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(aktion);
  } catch (error) {
    console.error('Error updating aktion:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Aktion' },
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

    await prisma.aktion.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting aktion:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Aktion' },
      { status: 500 }
    );
  }
}
