export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "profesor"
  createdAt: string
}

export interface Tool {
  id: string
  name: string
  description: string
  category: string
  qrCode: string
  status: "available" | "borrowed" | "maintenance"
  location: string
  createdAt: string
  updatedAt: string
}

export interface Loan {
  id: string
  toolId: string
  userId: string
  borrowedAt: string
  returnedAt?: string
  status: "active" | "returned" | "overdue"
  notes?: string
}

export interface Category {
  id: string
  name: string
  description: string
  color: string
}

// Mock data for demonstration
export const mockUsers: User[] = [
  {
    id: "1",
    name: "María González",
    email: "maria.gonzalez@colegio.edu",
    role: "admin",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@colegio.edu",
    role: "profesor",
    createdAt: "2024-01-16T09:30:00Z",
  },
  {
    id: "3",
    name: "Ana Martínez",
    email: "ana.martinez@colegio.edu",
    role: "profesor",
    createdAt: "2024-01-17T11:15:00Z",
  },
]

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "Herramientas Manuales",
    description: "Martillos, destornilladores, llaves",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "2",
    name: "Herramientas Eléctricas",
    description: "Taladros, sierras, lijadoras",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "3",
    name: "Instrumentos de Medición",
    description: "Reglas, calibradores, niveles",
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "4",
    name: "Equipos de Seguridad",
    description: "Cascos, guantes, gafas",
    color: "bg-orange-100 text-orange-800",
  },
]

export const mockTools: Tool[] = [
  {
    id: "1",
    name: "Taladro Eléctrico Bosch",
    description: "Taladro percutor de 650W con maletín",
    category: "Herramientas Eléctricas",
    qrCode: "TOOL-001-2024",
    status: "available",
    location: "Taller A - Estante 1",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z",
  },
  {
    id: "2",
    name: "Martillo de Carpintero",
    description: "Martillo de acero con mango de madera",
    category: "Herramientas Manuales",
    qrCode: "TOOL-002-2024",
    status: "borrowed",
    location: "Taller B - Estante 2",
    createdAt: "2024-01-11T09:15:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "3",
    name: "Nivel de Burbuja",
    description: "Nivel de aluminio de 60cm",
    category: "Instrumentos de Medición",
    qrCode: "TOOL-003-2024",
    status: "available",
    location: "Taller A - Estante 3",
    createdAt: "2024-01-12T10:30:00Z",
    updatedAt: "2024-01-12T10:30:00Z",
  },
  {
    id: "4",
    name: "Casco de Seguridad",
    description: "Casco blanco con ajuste de correa",
    category: "Equipos de Seguridad",
    qrCode: "TOOL-004-2024",
    status: "available",
    location: "Almacén - Estante Seguridad",
    createdAt: "2024-01-13T11:45:00Z",
    updatedAt: "2024-01-13T11:45:00Z",
  },
]

export const mockLoans: Loan[] = [
  {
    id: "1",
    toolId: "2",
    userId: "2",
    borrowedAt: "2024-01-20T14:30:00Z",
    status: "active",
    notes: "Para proyecto de carpintería",
  },
]

// LocalStorage utilities
export const STORAGE_KEYS = {
  USERS: "inventory_users",
  TOOLS: "inventory_tools",
  LOANS: "inventory_loans",
  CATEGORIES: "inventory_categories",
  CURRENT_USER: "inventory_current_user",
}

export const initializeData = () => {
  if (typeof window === "undefined") return

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers))
  }
  if (!localStorage.getItem(STORAGE_KEYS.TOOLS)) {
    localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(mockTools))
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOANS)) {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(mockLoans))
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(mockCategories))
  }
}

export const getStoredData = (key: string): any[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

export const setStoredData = (key: string, data: any[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}
