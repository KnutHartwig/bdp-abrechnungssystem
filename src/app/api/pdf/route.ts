import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateAbrechnungPDF } from '@/lib/pdf-generator';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { aktionId } = body;

    if (!aktionId) {
      return NextResponse.json(
        { success: false, error: 'Aktion-ID fehlt' },
        { status: 400 }
      );
    }

    const result = await generateAbrechnungPDF(aktionId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Relativen Pfad für Frontend zurückgeben
    const relativePath = result.pdfPath?.replace(process.cwd() + '/public', '');

    return NextResponse.json({
      success: true,
      data: {
        pdfUrl: relativePath,
        pdfPath: result.pdfPath,
      },
    });
  } catch (error) {
    console.error('PDF-API-Fehler:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler bei PDF-Generierung' },
      { status: 500 }
    );
  }
}
