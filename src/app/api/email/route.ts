import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendAbrechnungEmail, sendErrorNotification } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import path from 'path'

export async function POST(request: NextRequest) {
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
    const { aktionId, pdfUrl, metadata } = body

    if (!aktionId || !pdfUrl || !metadata) {
      return NextResponse.json(
        {
          success: false,
          error: 'Erforderliche Daten fehlen',
        },
        { status: 400 }
      )
    }

    // Aktion laden
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

    // PDF-Pfad konstruieren
    const pdfPath = path.join(process.cwd(), 'public', pdfUrl)

    // Email versenden
    await sendAbrechnungEmail(
      aktion.titel,
      metadata.gesamtbetrag,
      metadata.anzahlPosten,
      pdfPath
    )

    // Status aller Abrechnungen auf VERSENDET setzen
    await prisma.abrechnung.updateMany({
      where: {
        aktionId,
        status: {
          in: ['ENTWURF', 'EINGEREICHT'],
        },
      },
      data: {
        status: 'VERSENDET',
        versendetAt: new Date(),
      },
    })

    // Flow-Log aktualisieren
    await prisma.flowLog.updateMany({
      where: {
        aktionId,
        pdfUrl,
      },
      data: {
        emailVersendet: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Email erfolgreich versendet',
    })
  } catch (error: any) {
    console.error('POST /api/email error:', error)

    // Fehler-Benachrichtigung senden
    try {
      const body = await request.json()
      const { aktionId, metadata } = body

      if (aktionId && metadata) {
        await sendErrorNotification(
          aktionId,
          metadata.aktion.titel,
          error.message
        )
      }
    } catch (notifyError) {
      console.error('Error notification failed:', notifyError)
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Versenden der Email',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
