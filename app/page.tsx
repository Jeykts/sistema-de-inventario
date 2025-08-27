"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Package, QrCode, BookOpen, Settings, LogOut, Plus } from "lucide-react"
import {
  initializeData,
  getStoredData,
  setStoredData,
  STORAGE_KEYS,
  type Tool,
  type Loan,
  type User,
  type Category,
} from "@/lib/data"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { DashboardStats } from "@/components/dashboard-stats"
import { InventoryOverview } from "@/components/inventory-overview"
import { RecentActivity } from "@/components/recent-activity"
import { QRScanner } from "@/components/qr-scanner"
import { QRGenerator } from "@/components/qr-generator"
import { QRScanResult } from "@/components/qr-scan-result"

function DashboardContent() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showQRGenerator, setShowQRGenerator] = useState<{ toolId: string; toolName: string; qrCode: string } | null>(
    null,
  )
  const [scanResult, setScanResult] = useState<{ code: string; tool: Tool | null } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    initializeData()
    loadData()
  }, [])

  const loadData = () => {
    setTools(getStoredData<Tool>(STORAGE_KEYS.TOOLS))
    setLoans(getStoredData<Loan>(STORAGE_KEYS.LOANS))
    setUsers(getStoredData<User>(STORAGE_KEYS.USERS))
    setCategories(getStoredData<Category>(STORAGE_KEYS.CATEGORIES))
  }

  const handleQRScan = (scannedCode: string) => {
    console.log(`[v0] QR Code scanned: ${scannedCode}`)

    const tool = tools.find((t) => t.qrCode === scannedCode)
    setScanResult({ code: scannedCode, tool })
    setShowQRScanner(false)
  }

  const handleToolAction = (toolId: string, action: "borrow" | "return" | "maintenance" | "edit" | "delete") => {
    console.log(`[v0] Tool action: ${action} for tool ${toolId}`)

    const tool = tools.find((t) => t.id === toolId)
    if (!tool) return

    switch (action) {
      case "edit":
        // Show QR generator for the tool
        setShowQRGenerator({
          toolId: tool.id,
          toolName: tool.name,
          qrCode: tool.qrCode,
        })
        break
      default:
        console.log(`[v0] Action ${action} will be implemented in next task`)
        break
    }
  }

  const handleScanResultAction = async (action: "borrow" | "return" | "maintenance") => {
    if (!scanResult?.tool || !user) return

    setIsProcessing(true)
    console.log(`[v0] Processing ${action} for tool ${scanResult.tool.id}`)

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const updatedTools = tools.map((tool) => {
        if (tool.id === scanResult.tool!.id) {
          switch (action) {
            case "borrow":
              return { ...tool, status: "borrowed" as const, updatedAt: new Date().toISOString() }
            case "return":
              return { ...tool, status: "available" as const, updatedAt: new Date().toISOString() }
            case "maintenance":
              return { ...tool, status: "available" as const, updatedAt: new Date().toISOString() }
            default:
              return tool
          }
        }
        return tool
      })

      // Update loans if borrowing or returning
      let updatedLoans = [...loans]
      if (action === "borrow") {
        const newLoan: Loan = {
          id: Date.now().toString(),
          toolId: scanResult.tool.id,
          userId: user.id,
          borrowedAt: new Date().toISOString(),
          status: "active",
          notes: `Prestado via QR Scanner`,
        }
        updatedLoans.push(newLoan)
      } else if (action === "return") {
        updatedLoans = updatedLoans.map((loan) => {
          if (loan.toolId === scanResult.tool!.id && loan.status === "active") {
            return {
              ...loan,
              returnedAt: new Date().toISOString(),
              status: "returned" as const,
            }
          }
          return loan
        })
      }

      // Save to localStorage
      setStoredData(STORAGE_KEYS.TOOLS, updatedTools)
      setStoredData(STORAGE_KEYS.LOANS, updatedLoans)

      // Update state
      setTools(updatedTools)
      setLoans(updatedLoans)

      console.log(`[v0] Successfully processed ${action}`)
    } catch (error) {
      console.error(`[v0] Error processing ${action}:`, error)
    } finally {
      setIsProcessing(false)
      setScanResult(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Package className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Sistema de Inventario</h1>
                <p className="text-sm text-muted-foreground">Colegio - Gestión de Herramientas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              )}
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Dashboard */}
        <div className="mb-8">
          <DashboardStats tools={tools} loans={loans} users={users} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button
            className="h-16 text-left justify-start bg-transparent"
            variant="outline"
            onClick={() => setShowQRScanner(true)}
          >
            <QrCode className="w-6 h-6 mr-3 text-primary" />
            <div>
              <div className="font-medium">Escanear QR</div>
              <div className="text-sm text-muted-foreground">Prestar o devolver herramienta</div>
            </div>
          </Button>

          <Button className="h-16 text-left justify-start bg-transparent" variant="outline">
            <Plus className="w-6 h-6 mr-3 text-accent" />
            <div>
              <div className="font-medium">Agregar Herramienta</div>
              <div className="text-sm text-muted-foreground">Registrar nueva herramienta</div>
            </div>
          </Button>

          <Button className="h-16 text-left justify-start bg-transparent" variant="outline">
            <BookOpen className="w-6 h-6 mr-3 text-orange-600" />
            <div>
              <div className="font-medium">Ver Préstamos</div>
              <div className="text-sm text-muted-foreground">Gestionar préstamos activos</div>
            </div>
          </Button>

          <Button className="h-16 text-left justify-start bg-transparent" variant="outline">
            <Package className="w-6 h-6 mr-3 text-purple-600" />
            <div>
              <div className="font-medium">Reportes</div>
              <div className="text-sm text-muted-foreground">Estadísticas y análisis</div>
            </div>
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Overview - Takes 2 columns */}
          <div className="lg:col-span-2">
            <InventoryOverview tools={tools} categories={categories} onToolAction={handleToolAction} />
          </div>

          {/* Recent Activity - Takes 1 column */}
          <div className="lg:col-span-1">
            <RecentActivity tools={tools} loans={loans} users={users} />
          </div>
        </div>
      </main>

      {/* QR Scanner Modal */}
      <QRScanner isOpen={showQRScanner} onScanResult={handleQRScan} onClose={() => setShowQRScanner(false)} />

      {/* QR Generator Modal */}
      {showQRGenerator && (
        <QRGenerator
          toolId={showQRGenerator.toolId}
          toolName={showQRGenerator.toolName}
          qrCode={showQRGenerator.qrCode}
          onClose={() => setShowQRGenerator(null)}
        />
      )}

      {/* QR Scan Result Modal */}
      {scanResult && user && (
        <QRScanResult
          scannedCode={scanResult.code}
          tool={scanResult.tool}
          currentUser={user}
          onAction={handleScanResultAction}
          onClose={() => setScanResult(null)}
          isProcessing={isProcessing}
        />
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
