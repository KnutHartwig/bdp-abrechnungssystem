import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { validateFile, generateFilename } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'Keine Datei hochgeladen',
        },
        { status: 400 }
      )
    }

    // Datei validieren
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      )
    }

    // Dateiname generieren
    const fileExtension = file.name.split('.').pop() || 'pdf'
    const filename = generateFilename('beleg', fileExtension)

    // Upload-Verzeichnis erstellen
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    // Datei speichern
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const filePath = path.join(uploadsDir, filename)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${filename}`

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        filename: file.name,
        size: file.size,
        type: file.type,
      },
      message: 'Datei erfolgreich hochgeladen',
    })
  } catch (error: any) {
    console.error('POST /api/upload error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Hochladen der Datei',
      },
      { status: 500 }
    )
  }
}
