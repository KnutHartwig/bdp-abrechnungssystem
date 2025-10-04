import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { berechneFahrtkosten } from '@/lib/utils';
import { z } from 'zod';

// Validation Schema
const abrechnungSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  stamm: z.string().min(1, 'Stamm ist erforderlich'),
  email: z.string().email('Gültige E-Mail erforderlich'),
  aktionId: z.string(),
  kategorie: z.enum([
    'TEILNAHMEBEITRAEGE',
    'FAHRTKOSTEN',
    'UNTERKUNFT',
    'VERPFLEGUNG',
    'MATERIAL',
    'PORTO',
    'TELEKOMMUNIKATION',
    'SONSTIGE_AUSGABEN',
    'HONORARE',
    'VERSICHERUNGEN',
    'MIETE',
  ]),
  belegbeschreibung: z.string().optional(),
  belegdatum: z.string(),
  betrag: z.number().positive('Betrag muss positiv sein'),
  belegUrl: z.string().optional(),
  // Fahrtkosten
  fahrzeugtyp: z.enum(['PKW', 'TRANSPORTER', 'BUS', 'MOTORRAD']).optional(),
  kilometer: z.number().optional(),
  mitfahrer: z.number().optional(),
  zuschlagLagerleitung: z.boolean().optional(),
  zuschlagMaterial: z.boolean().optional(),
  zuschlagAnhaenger: z.boolean().optional(),
});

// GET - Liste aller Abrechnungen
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

    return NextResponse.json(abrechnungen);
  } catch (error) {
    console.error('GET Error:', error);
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
    
    // Validierung
    const validated = abrechnungSchema.parse(body);

    // Fahrtkosten automatisch berechnen, falls Kategorie FAHRTKOSTEN
    let betrag = validated.betrag;
    let kmSatz = null;

    if (
      validated.kategorie === 'FAHRTKOSTEN' &&
      validated.fahrzeugtyp &&
      validated.kilometer
    ) {
      betrag = berechneFahrtkosten({
        fahrzeugtyp: validated.fahrzeugtyp,
        kilometer: validated.kilometer,
        mitfahrer: validated.mitfahrer || 0,
        zuschlagLagerleitung: validated.zuschlagLagerleitung || false,
        zuschlagMaterial: validated.zuschlagMaterial || false,
        zuschlagAnhaenger: validated.zuschlagAnhaenger || false,
      });

      // Basis-Satz speichern
      const basisSaetze: Record<string, number> = {
        PKW: 0.3,
        TRANSPORTER: 0.4,
        BUS: 0.5,
        MOTORRAD: 0.1,
      };
      kmSatz = basisSaetze[validated.fahrzeugtyp];
    }

    // In Datenbank speichern
    const abrechnung = await prisma.abrechnung.create({
      data: {
        name: validated.name,
        stamm: validated.stamm,
        email: validated.email,
        aktionId: validated.aktionId,
        kategorie: validated.kategorie,
        belegbeschreibung: validated.belegbeschreibung,
        belegdatum: new Date(validated.belegdatum),
        betrag,
        belegUrl: validated.belegUrl,
        status: 'EINGEREICHT',
        // Fahrtkosten-Felder
        fahrzeugtyp: validated.fahrzeugtyp,
        kilometer: validated.kilometer,
        kmSatz,
        mitfahrer: validated.mitfahrer,
        zuschlagLagerleitung: validated.zuschlagLagerleitung,
        zuschlagMaterial: validated.zuschlagMaterial,
        zuschlagAnhaenger: validated.zuschlagAnhaenger,
      },
      include: {
        aktion: true,
      },
    });

    return NextResponse.json(abrechnung, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validierungsfehler', details: error.errors },
        { status: 400 }
      );
    }

    console.error('POST Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Abrechnung' },
      { status: 500 }
    );
  }
}

// PATCH - Abrechnung aktualisieren (z.B. Status ändern)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID ist erforderlich' },
        { status: 400 }
      );
    }

    const abrechnung = await prisma.abrechnung.update({
      where: { id },
      data: updateData,
      include: {
        aktion: true,
      },
    });

    return NextResponse.json(abrechnung);
  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Abrechnung' },
      { status: 500 }
    );
  }
}

// DELETE - Abrechnung löschen
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID ist erforderlich' },
        { status: 400 }
      );
    }

    await prisma.abrechnung.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Abrechnung' },
      { status: 500 }
    );
  }
}
