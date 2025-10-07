import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Matilde - BdP Landesverband Baden-Württemberg e.V.',
  description: 'Automatisiertes Abrechnungssystem Matilde für den BdP Landesverband Baden-Württemberg e.V.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <nav className="bg-bdp-primary text-white shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="font-bold text-xl">
                Matilde
              </Link>
              <div className="flex gap-4">
                <Link href="/abrechnung" className="hover:text-bdp-accent transition">
                  Neue Abrechnung
                </Link>
                <Link href="/admin" className="hover:text-bdp-accent transition">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        <footer className="bg-gray-100 border-t mt-auto">
          <div className="container mx-auto px-4 py-6 text-center text-gray-600">
            <p>© 2025 BdP Landesverband Baden-Württemberg e.V.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
