import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { sanitizeFilename } from '@/lib/utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      );
    }

    // Validierung: Dateigröße
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Datei zu groß (max. 5MB)' },
        { status: 400 }
      );
    }

    // Validierung: Dateityp
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Dateityp nicht erlaubt (nur JPG, PNG, PDF)' },
        { status: 400 }
      );
    }

    // Dateiname sanitizen und Timestamp hinzufügen
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const sanitizedName = sanitizeFilename(baseName);
    const filename = `${timestamp}_${sanitizedName}${extension}`;

    // Upload-Ordner erstellen falls nicht vorhanden
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Datei speichern
    const filepath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // URL für Frontend
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: filename,
      originalName: originalName,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Hochladen der Datei' },
      { status: 500 }
    );
  }
}

// GET - Datei-Info abrufen
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename fehlt' },
        { status: 400 }
      );
    }

    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
    
    return NextResponse.json({
      exists: true,
      url: `/uploads/${filename}`,
    });
  } catch (error) {
    return NextResponse.json(
      { exists: false },
      { status: 404 }
    );
  }
}
