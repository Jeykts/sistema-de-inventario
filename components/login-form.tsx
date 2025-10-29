"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Por favor, completa todos los campos")
      return
    }

    const success = await login(email, password)
    if (!success) {
      setError("Credenciales incorrectas. Intenta de nuevo.")
    }
  }

  const demoCredentials = [
    { email: "maria.gonzalez@colegio.edu", role: "Administrador" },
    { email: "carlos.rodriguez@colegio.edu", role: "Profesor" },
    { email: "ana.martinez@colegio.edu", role: "Profesor" },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg space-y-8">
        {/* Header - Más grande y accesible */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mx-auto">
            <Package className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Sistema de Inventario</h1>
          <p className="text-lg text-muted-foreground">Colegio - Gestión de Herramientas</p>
        </div>

        {/* Login Form - Diseño accesible */}
        <Card className="border-2">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription className="text-base mt-2">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-lg font-medium">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu.email@colegio.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-lg font-medium">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-12 text-lg"
                />
              </div>

              {error && (
                <Alert variant="destructive" className="border-2">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="text-base font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-14 text-lg font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials - Más accesible */}
        <Card className="bg-blue-50 border-2 border-blue-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-blue-900">Cuentas de Prueba</CardTitle>
            <CardDescription className="text-base text-blue-700">
              Puedes usar cualquiera de estas cuentas para probar el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoCredentials.map((cred, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                <span className="font-mono text-sm bg-blue-100 px-3 py-2 rounded text-blue-900 font-medium">
                  {cred.email}
                </span>
                <span className="text-blue-700 font-medium">{cred.role}</span>
              </div>
            ))}
            <p className="text-sm text-blue-800 text-center mt-3">
              <strong>Nota:</strong> La contraseña puede ser cualquier texto
            </p>
          </CardContent>
        </Card>

        {/* Demo Mode Button - Más prominente y accesible */}
        <Card className="bg-green-50 border-2 border-green-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-green-900">¿Quieres Probar el Sistema?</CardTitle>
            <CardDescription className="text-lg text-green-700">
              Haz clic aquí para acceder al modo demostración
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-700 text-white border-2 border-green-700"
              onClick={() => {
                // Simulate login with demo user
                const demoUser = demoCredentials[0] // Use first demo user
                login(demoUser.email, 'demo123')
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Iniciando modo demo...
                </>
              ) : (
                "🚀 Modo Demo (Sin Cámaras)"
              )}
            </Button>
            <p className="text-base text-center mt-4 text-green-800 font-medium">
              Prueba todas las funciones sin necesidad de escanear códigos QR
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
