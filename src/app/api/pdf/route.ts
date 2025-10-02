import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateAbrechnungsPDF, savePDFToFile } from '@/lib/pdf-generator'
import { generateFilename } from '@/lib/utils'
import { prisma } from '@/lib/prisma'

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
    const { aktionId, inkludiereEntwuerfe = false } = body

    if (!aktionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aktion-ID fehlt',
        },
        { status: 400 }
      )
    }

    // PDF generieren
    const { pdfBuffer, metadata } = await generateAbrechnungsPDF(aktionId, {
      inkludiereEntwuerfe,
    })

    // PDF speichern
    const filename = generateFilename(
      `Abrechnung_${metadata.aktion.titel.replace(/[^a-z0-9]/gi, '_')}`
    )
    const pdfUrl = await savePDFToFile(pdfBuffer, filename)

    // Flow-Log erstellen
    await prisma.flowLog.create({
      data: {
        aktionId,
        aktionTitel: metadata.aktion.titel,
        anzahlPosten: metadata.anzahlPosten,
        gesamtbetrag: metadata.gesamtbetrag,
        status: 'SUCCESS',
        pdfUrl,
        emailVersendet: false,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        pdfUrl,
        metadata,
      },
      message: 'PDF erfolgreich erstellt',
    })
  } catch (error: any) {
    console.error('POST /api/pdf error:', error)

    // Fehler-Log erstellen falls möglich
    try {
      const body = await request.json()
      const { aktionId } = body

      if (aktionId) {
        const aktion = await prisma.aktion.findUnique({
          where: { id: aktionId },
        })

        if (aktion) {
          await prisma.flowLog.create({
            data: {
              aktionId,
              aktionTitel: aktion.titel,
              anzahlPosten: 0,
              gesamtbetrag: 0,
              status: 'ERROR',
              fehler: error.message,
              emailVersendet: false,
            },
          })
        }
      }
    } catch (logError) {
      console.error('Error logging failed:', logError)
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Erstellen der PDF',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// GET - PDF-Vorschau/Download
export async function GET(request: NextRequest) {
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
    const aktionId = searchParams.get('aktionId')

    if (!aktionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aktion-ID fehlt',
        },
        { status: 400 }
      )
    }

    // PDF generieren
    const { pdfBuffer, metadata } = await generateAbrechnungsPDF(aktionId)

    // Als Download zurückgeben
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Abrechnung_${metadata.aktion.titel.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('GET /api/pdf error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Abrufen der PDF',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
