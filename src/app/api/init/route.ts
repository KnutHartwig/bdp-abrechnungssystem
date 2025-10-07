import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

/**
 * Automatische Datenbank-Initialisierung
 * Erstellt Admin-User, wenn die Datenbank leer ist
 */
export async function GET() {
  try {
    // Prüfe ob User existieren
    const userCount = await prisma.user.count();
    
    // Wenn User existieren, ist alles gut
    if (userCount > 0) {
      return NextResponse.json({
        status: 'ok',
        initialized: true,
        message: 'Datenbank bereits initialisiert',
      });
    }

    // Keine User vorhanden - erstelle Default-User
    console.log('🌱 Keine User gefunden - erstelle Admin-Accounts...');
    
    const defaultPassword = 'admin123';
    const hashedPassword = await hash(defaultPassword, 10);
    
    // Erstelle Landeskasse-User
    await prisma.user.create({
      data: {
        email: 'kasse@bdp-bawue.de',
        name: 'Landeskasse',
        password: hashedPassword,
        role: 'LANDESKASSE',
      },
    });

    // Erstelle Admin-User
    await prisma.user.create({
      data: {
        email: 'admin@bdp-bawue.de',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin-Accounts erfolgreich erstellt');

    return NextResponse.json({
      status: 'ok',
      initialized: true,
      created: true,
      message: 'Datenbank wurde automatisch initialisiert',
      users: [
        { email: 'kasse@bdp-bawue.de', password: defaultPassword },
        { email: 'admin@bdp-bawue.de', password: defaultPassword },
      ],
    });
  } catch (error) {
    console.error('❌ Fehler bei der Initialisierung:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }, { status: 500 });
  }
}
