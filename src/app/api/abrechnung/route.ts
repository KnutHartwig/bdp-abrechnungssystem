import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateBetrag, berechneFahrtkosten } from '@/lib/utils'
import { Prisma } from '@prisma/client'

// GET - Alle Abrechnungen oder gefiltert
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const aktionId = searchParams.get('aktionId')
    const kategorieId = searchParams.get('kategorieId')
    const status = searchParams.get('status')
    const email = searchParams.get('email')

    const where: Prisma.AbrechnungWhereInput = {}

    if (aktionId) {
      where.aktionId = aktionId
    }

    if (kategorieId) {
      where.kategorieId = kategorieId
    }

    if (status) {
      where.status = status as any
    }

    if (email) {
      where.email = email
    }

    const abrechnungen = await prisma.abrechnung.findMany({
      where,
      include: {
        aktion: true,
        kategorie: true,
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({
      success: true,
      data: abrechnungen,
    })
  } catch (error: any) {
    console.error('GET /api/abrechnung error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Abrufen der Abrechnungen',
      },
      { status: 500 }
    )
  }
}

// POST - Neue Abrechnung erstellen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

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
      streckeKm,
      mitfahrer,
      istLagerleitung,
      hatMaterial,
      hatAnhaenger,
      belegUrl,
      belegDateiname,
    } = body

    // Validierung
    if (!name || !stamm || !email || !aktionId || !kategorieId || !belegdatum) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pflichtfelder fehlen',
        },
        { status: 400 }
      )
    }

    // Betrag validieren oder berechnen
    let finalBetrag = betrag
    let kmSatz = null

    // Fahrtkosten automatisch berechnen
    if (fahrzeugtyp && streckeKm) {
      const berechnung = berechneFahrtkosten({
        fahrzeugtyp,
        streckeKm: parseFloat(streckeKm),
        istLagerleitung: istLagerleitung || false,
        hatMaterial: hatMaterial || false,
        hatAnhaenger: hatAnhaenger || false,
      })
      
      finalBetrag = berechnung.betrag
      kmSatz = berechnung.gesamtSatz
    }

    const betragValidation = validateBetrag(finalBetrag)
    if (!betragValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: betragValidation.error,
        },
        { status: 400 }
      )
    }

    // Aktion prüfen
    const aktion = await prisma.aktion.findUnique({
      where: { id: aktionId },
    })

    if (!aktion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aktion nicht gefunden',
        },
        { status: 404 }
      )
    }

    if (aktion.status !== 'AKTIV') {
      return NextResponse.json(
        {
          success: false,
          error: 'Aktion ist nicht aktiv',
        },
        { status: 400 }
      )
    }

    // Kategorie prüfen
    const kategorie = await prisma.kategorie.findUnique({
      where: { id: kategorieId },
    })

    if (!kategorie || !kategorie.aktiv) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kategorie nicht gefunden oder inaktiv',
        },
        { status: 404 }
      )
    }

    // Abrechnung erstellen
    const abrechnung = await prisma.abrechnung.create({
      data: {
        name,
        stamm,
        email,
        aktionId,
        kategorieId,
        belegbeschreibung: belegbeschreibung || null,
        belegdatum: new Date(belegdatum),
        betrag: finalBetrag,
        fahrzeugtyp: fahrzeugtyp || null,
        streckeKm: streckeKm ? parseFloat(streckeKm) : null,
        mitfahrer: mitfahrer || 0,
        istLagerleitung: istLagerleitung || false,
        hatMaterial: hatMaterial || false,
        hatAnhaenger: hatAnhaenger || false,
        kmSatz: kmSatz,
        belegUrl: belegUrl || null,
        belegDateiname: belegDateiname || null,
        status: 'EINGEREICHT',
      },
      include: {
        aktion: true,
        kategorie: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: abrechnung,
      message: 'Abrechnung erfolgreich erstellt',
    })
  } catch (error: any) {
    console.error('POST /api/abrechnung error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Erstellen der Abrechnung',
      },
      { status: 500 }
    )
  }
}

// PATCH - Abrechnung aktualisieren (nur für Admins)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'LANDESKASSE'].includes(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Keine Berechtigung',
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID fehlt',
        },
        { status: 400 }
      )
    }

    const abrechnung = await prisma.abrechnung.update({
      where: { id },
      data: updates,
      include: {
        aktion: true,
        kategorie: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: abrechnung,
    })
  } catch (error: any) {
    console.error('PATCH /api/abrechnung error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Aktualisieren der Abrechnung',
      },
      { status: 500 }
    )
  }
}

// DELETE - Abrechnung löschen (nur für Admins)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'LANDESKASSE'].includes(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Keine Berechtigung',
        },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID fehlt',
        },
        { status: 400 }
      )
    }

    await prisma.abrechnung.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Abrechnung gelöscht',
    })
  } catch (error: any) {
    console.error('DELETE /api/abrechnung error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Löschen der Abrechnung',
      },
      { status: 500 }
    )
  }
}
