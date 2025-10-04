import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { SessionProvider } from '@/components/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BdP Abrechnungssystem',
  description: 'Abrechnungssystem für BdP Landesverband Baden-Württemberg e.V.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <SessionProvider>
          <nav className="bg-bdp-blue-dark text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center space-x-8">
                  <Link href="/" className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-bdp-gold rounded-full flex items-center justify-center font-bold text-white">
                      BdP
                    </div>
                    <span className="font-bold text-xl">Abrechnungssystem</span>
                  </Link>
                  <div className="hidden md:flex space-x-4">
                    <Link
                      href="/"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-bdp-blue transition"
                    >
                      Start
                    </Link>
                    <Link
                      href="/abrechnung"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-bdp-blue transition"
                    >
                      Abrechnung einreichen
                    </Link>
                    <Link
                      href="/admin"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-bdp-blue transition"
                    >
                      Admin
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <main className="min-h-screen bg-gray-50">{children}</main>

          <footer className="bg-gray-800 text-white py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <p className="text-sm">
                  © 2025 BdP Landesverband Baden-Württemberg e.V.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Abrechnungssystem v1.1.0 | Entwickelt mit Next.js
                </p>
              </div>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
