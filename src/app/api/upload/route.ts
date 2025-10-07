import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { validateFile, generateUniqueFilename } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Keine Datei hochgeladen' },
        { status: 400 }
      );
    }

    // Validierung
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB
    const validation = validateFile(file, maxSize);
    
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Datei speichern
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = generateUniqueFilename(file.name);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      data: {
        url,
        filename,
        size: file.size,
      },
    });
  } catch (error) {
    console.error('Upload-Fehler:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Hochladen der Datei' },
      { status: 500 }
    );
  }
}
