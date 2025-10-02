import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BdP Abrechnungssystem',
  description: 'Automatisiertes Abrechnungssystem für den BdP Landesverband Baden-Württemberg',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-primary-700 text-white shadow-lg">
            <div className="container-custom py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="text-2xl font-bold">
                    BdP Abrechnungssystem
                  </div>
                </Link>
                
                <nav className="flex items-center space-x-6">
                  <Link
                    href="/abrechnung"
                    className="hover:text-bdp-yellow transition-colors"
                  >
                    Abrechnung einreichen
                  </Link>
                  <Link
                    href="/admin"
                    className="hover:text-bdp-yellow transition-colors"
                  >
                    Admin
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-gray-800 text-gray-300 py-6 mt-12">
            <div className="container-custom">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  © {new Date().getFullYear()} BdP Landesverband Baden-Württemberg e.V.
                </div>
                <div className="text-sm">
                  <a
                    href="mailto:kasse@bdp-bawue.de"
                    className="hover:text-white transition-colors"
                  >
                    kasse@bdp-bawue.de
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
