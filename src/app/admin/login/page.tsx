import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import LoginForm from '@/components/admin/LoginForm'

export const metadata = {
  title: 'Login | BdP Abrechnungssystem',
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  // Bereits eingeloggt -> zur Admin-Seite
  if (session) {
    redirect('/admin')
  }

  return <LoginForm />
}
