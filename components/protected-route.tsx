"use client"

import type React from "react"
import { useEffect, useState } from "react"

import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/login-form"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "profesor"
  fallbackToMock?: boolean // Para desarrollo/pruebas
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackToMock = true 
}: ProtectedRouteProps) {
  const { user, isLoading, error, clearError } = useAuth()
  const [showMockUser, setShowMockUser] = useState(false)

  // Usuario mock para desarrollo/pruebas
  const mockUser = {
    id: "mock-1",
    name: "Usuario de Desarrollo",
    email: "dev@colegio.edu",
    role: "admin" as const,
    createdAt: new Date().toISOString()
  }

  useEffect(() => {
    // Si hay error y fallbackToMock está habilitado, mostrar opción de usuario mock
    if (error && fallbackToMock && !user) {
      const timer = setTimeout(() => {
        setShowMockUser(true)
      }, 3000) // Mostrar opción después de 3 segundos

      return () => clearTimeout(timer)
    }
  }, [error, fallbackToMock, user])

  // Estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
          {error && (
            <Alert className="max-w-md mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    )
  }

  // Mostrar errores con opción de reintentar
  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">Error de Autenticación</h1>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={clearError} 
              className="w-full"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
            
            {showMockUser && fallbackToMock && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Modo de desarrollo disponible:
                </p>
                <Button 
                  onClick={() => {
                    clearError()
                    // En un escenario real, esto sería manejado por el contexto
                    // Por ahora, simplemente limpiamos el error y continuamos
                    setShowMockUser(false)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Continuar sin autenticación (Desarrollo)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Si no hay usuario autenticado, mostrar formulario de login
  if (!user && !showMockUser) {
    return <LoginForm />
  }

  // Usar usuario real o mock según corresponda
  const currentUser = user || (fallbackToMock ? mockUser : null)

  // Verificar permisos de rol si es requerido
  if (requiredRole && currentUser && currentUser.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 mx-auto text-orange-500" />
          <h1 className="text-2xl font-bold text-foreground">Acceso Denegado</h1>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No tienes permisos para acceder a esta sección. Se requiere rol de <strong>{requiredRole}</strong>.
              Tu rol actual es: <strong>{currentUser.role}</strong>
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => window.history.back()} 
            variant="outline"
          >
            Volver
          </Button>
        </div>
      </div>
    )
  }

  // Si llegamos aquí, el usuario tiene acceso
  return <>{children}</>
}
