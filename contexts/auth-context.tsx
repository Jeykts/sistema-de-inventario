"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react"
import { type User } from "@/lib/data"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Función helper para verificar si estamos en el cliente
const isClient = typeof window !== 'undefined'

// Función helper para acceso seguro a localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isClient) return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('Error accessing localStorage:', error)
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isClient) return
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.warn('Error setting localStorage:', error)
    }
  },
  removeItem: (key: string): void => {
    if (!isClient) return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Error removing from localStorage:', error)
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const verifyToken = useCallback(async (token: string) => {
    if (!token || !isClient) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        if (userData?.user) {
          setUser(userData.user)
          setError(null)
        } else {
          throw new Error('Invalid user data received')
        }
      } else {
        safeLocalStorage.removeItem('auth_token')
        setError('Sesión expirada')
      }
    } catch (error) {
      console.error('Error verifying token:', error)
      safeLocalStorage.removeItem('auth_token')
      setError('Error al verificar la sesión')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (!isClient) {
      setIsLoading(false)
      return
    }

    // Check if user is already logged in via JWT token
    const token = safeLocalStorage.getItem('auth_token')
    if (token) {
      verifyToken(token)
    } else {
      setIsLoading(false)
    }
  }, [verifyToken])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) {
      setError('Email y contraseña son requeridos')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data?.user && data?.token) {
          setUser(data.user)
          safeLocalStorage.setItem('auth_token', data.token)
          setError(null)
          return true
        } else {
          throw new Error('Invalid response data')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.message || 'Credenciales inválidas')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Error de conexión. Intenta nuevamente.')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setError(null)
    safeLocalStorage.removeItem('auth_token')
  }, [])

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    error,
    clearError
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
