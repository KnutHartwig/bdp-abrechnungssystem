import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Alle Aktionen
export async function GET() {
  try {
    const aktionen = await prisma.aktion.findMany({
      orderBy: {
        startdatum: 'desc',
      },
    })

    return NextResponse.json(aktionen)
  } catch (error) {
    console.error('Fehler beim Abrufen der Aktionen:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Aktionen' },
      { status: 500 }
    )
  }
}
