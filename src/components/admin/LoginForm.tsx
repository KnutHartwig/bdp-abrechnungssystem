'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input, Button, Alert, Card, CardHeader, CardBody, Spinner } from '../ui'

export default function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Ungültige Anmeldedaten')
        setLoading(false)
        return
      }

      // Erfolgreich eingeloggt
      router.push('/admin')
      router.refresh()
      
    } catch (err: any) {
      setError('Ein Fehler ist aufgetreten')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Admin Login
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Melden Sie sich mit Ihren Zugangsdaten an
              </p>
            </div>
          </CardHeader>
          
          <CardBody>
            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="E-Mail-Adresse"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleChange}
                required
                placeholder="admin@bdp-bawue.de"
              />

              <Input
                label="Passwort"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Spinner size="sm" />
                    <span>Anmelden...</span>
                  </div>
                ) : (
                  'Anmelden'
                )}
              </Button>
            </form>
          </CardBody>
        </Card>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Probleme beim Login? Kontaktieren Sie{' '}
            <a
              href="mailto:kasse@bdp-bawue.de"
              className="text-primary-700 hover:text-primary-800"
            >
              kasse@bdp-bawue.de
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
