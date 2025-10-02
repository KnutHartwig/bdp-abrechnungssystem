import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Dashboard from '@/components/admin/Dashboard'

export const metadata = {
  title: 'Admin Dashboard | BdP Abrechnungssystem',
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
  }

  if (!['ADMIN', 'LANDESKASSE'].includes(session.user.role)) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Keine Berechtigung
          </h1>
          <p className="text-gray-600">
            Sie haben keine Berechtigung, auf diesen Bereich zuzugreifen.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <Dashboard />
    </div>
  )
}
