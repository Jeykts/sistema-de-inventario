"use client"

import React, { Component, type ReactNode } from "react"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Actualiza el estado para mostrar la UI de error
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Registra el error para debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Aquí podrías enviar el error a un servicio de logging
    // como Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Usar fallback personalizado si se proporciona
      if (this.props.fallback) {
        return this.props.fallback
      }

      // UI de error por defecto
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="space-y-4">
              <AlertCircle className="h-16 w-16 mx-auto text-destructive" />
              <h1 className="text-2xl font-bold text-foreground">
                ¡Oops! Algo salió mal
              </h1>
              <p className="text-muted-foreground">
                La aplicación encontró un error inesperado. Nuestro equipo ha sido notificado.
              </p>
            </div>

            {/* Mostrar detalles del error en desarrollo */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Alert className="text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-mono text-xs">
                  <strong>Error:</strong> {this.state.error.message}
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer">Stack trace</summary>
                      <pre className="mt-2 text-xs overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button 
                onClick={this.handleReset}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Intentar de nuevo
              </Button>
              
              <Button 
                onClick={this.handleReload}
                variant="outline"
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Recargar página
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Si el problema persiste, contacta al administrador del sistema.
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook para usar en componentes funcionales
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    // Aquí podrías enviar el error a un servicio de logging
  }
}

// Componente wrapper funcional para casos específicos
interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
        <h2 className="text-xl font-semibold text-foreground">
          Error en la aplicación
        </h2>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || 'Ha ocurrido un error inesperado'}
          </AlertDescription>
        </Alert>
        <Button onClick={resetError} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    </div>
  )
}
