"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Package, QrCode, BookOpen, Settings, LogOut, Plus, Search } from "lucide-react"
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
import { AddToolModal } from "@/components/add-tool-modal"
import { LoansModal } from "@/components/loans-modal"
import { BulkLoanModal } from "@/components/bulk-loan-modal"
import { SettingsModal } from "@/components/settings-modal"

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
  const [showAddToolModal, setShowAddToolModal] = useState(false)
  const [showLoansModal, setShowLoansModal] = useState(false)
  const [showBulkLoanModal, setShowBulkLoanModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout, error, clearError } = useAuth()

  const currentUser = user

  // Filtrar herramientas basado en la búsqueda
  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    initializeData()
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load tools from database
      const toolsResponse = await fetch('/api/tools')
      if (toolsResponse.ok) {
        const toolsData = await toolsResponse.json()
        setTools(toolsData)
      }

      // Load loans from database
      const loansResponse = await fetch('/api/loans')
      if (loansResponse.ok) {
        const loansData = await loansResponse.json()
        setLoans(loansData)
      }

      // Load users from database
      const usersResponse = await fetch('/api/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }

      // Load categories from database
      const categoriesResponse = await fetch('/api/categories')
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback to localStorage if API fails
      setTools(getStoredData(STORAGE_KEYS.TOOLS))
      setLoans(getStoredData(STORAGE_KEYS.LOANS))
      setUsers(getStoredData(STORAGE_KEYS.USERS))
      setCategories(getStoredData(STORAGE_KEYS.CATEGORIES))
    }
  }

  const handleQRScan = (scannedCode: string) => {
    console.log(`[v0] QR Code scanned: ${scannedCode}`)

    const tool = tools.find((t) => t.qrCode === scannedCode) || null
    setScanResult({ code: scannedCode, tool })
    setShowQRScanner(false)
  }

  const handleToolAction = async (toolId: string, action: "borrow" | "return" | "maintenance" | "edit" | "delete") => {
    console.log(`[v0] Tool action: ${action} for tool ${toolId}`)

    const tool = tools.find((t) => t.id === toolId)
    if (!tool) return

    switch (action) {
      case "borrow":
        if (!currentUser) return

        try {
          // Create loan via API
          const response = await fetch('/api/loans', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              toolId: tool.id,
              userId: currentUser.id,
              quantity: 1,
              notes: `Prestado desde inventario`,
            }),
          })

          if (!response.ok) {
            throw new Error('Error creating loan')
          }

          console.log(`[v0] Successfully created loan for ${tool.name}`)
          loadData() // Reload data to reflect changes
        } catch (error) {
          console.error(`[v0] Error creating loan:`, error)
        }
        break

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
    if (!scanResult?.tool || !currentUser) return

    setIsProcessing(true)
    console.log(`[v0] Processing ${action} for tool ${scanResult.tool.id}`)

    try {
      if (action === "borrow") {
        // Create loan via API
        const response = await fetch('/api/loans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            toolId: scanResult.tool.id,
            userId: currentUser.id,
            quantity: 1,
            notes: `Prestado via QR Scanner`,
          }),
        })

        if (!response.ok) {
          throw new Error('Error creating loan')
        }

        console.log(`[v0] Successfully created loan for ${scanResult.tool.name}`)
      } else if (action === "return") {
        // Find active loan for this tool and user
        const activeLoan = loans.find(
          (loan) => scanResult.tool && loan.toolId === scanResult.tool.id &&
                   loan.userId === currentUser.id &&
                   loan.status === "ACTIVE"
        )

        if (activeLoan) {
          // Return loan via API
          const response = await fetch(`/api/loans/${activeLoan.id}/return`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              returnedQuantity: activeLoan.quantity,
            }),
          })

          if (!response.ok) {
            throw new Error('Error returning loan')
          }

          console.log(`[v0] Successfully returned loan for ${scanResult.tool.name}`)
        } else {
          throw new Error('No active loan found for this tool')
        }
      }

      // Reload data to reflect changes
      loadData()

      console.log(`[v0] Successfully processed ${action}`)
    } catch (error) {
      console.error(`[v0] Error processing ${action}:`, error)
    } finally {
      setIsProcessing(false)
      setScanResult(null)
    }
  }

  const handleAddTool = (newToolData: Omit<Tool, "id" | "createdAt" | "updatedAt">) => {
    const newTool: Tool = {
      ...newToolData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedTools = [...tools, newTool]
    setStoredData(STORAGE_KEYS.TOOLS, updatedTools)
    setTools(updatedTools)
    
    console.log(`[v0] New tool added: ${newTool.name}`)
  }

  const handleReturnTool = (loanId: string) => {
    // The return is already handled by the API call in the loans modal
    // Just reload the data to reflect the changes
    loadData()
    console.log(`[v0] Tool returned via loans modal: ${loanId}`)
  }

  const handleBulkLoan = async (loanData: {
    userInfo: { name: string; lastName: string; course: string }
    toolLoans: { toolId: string; quantity: number }[]
  }) => {
    if (!currentUser || loanData.toolLoans.length === 0) return

    console.log(`[v0] Processing bulk loan for ${loanData.toolLoans.length} tool loans`)

    try {
      // Create loans for each tool loan
      for (const toolLoan of loanData.toolLoans) {
        const response = await fetch('/api/loans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            toolId: toolLoan.toolId,
            userId: currentUser.id, // Use current logged in user
            quantity: toolLoan.quantity,
            notes: `Préstamo múltiple - Usuario: ${loanData.userInfo.name} ${loanData.userInfo.lastName} (${loanData.userInfo.course})`,
          }),
        })

        if (!response.ok) {
          throw new Error('Error creating loan')
        }
      }

      // Reload data to reflect changes
      loadData()

      console.log(`[v0] Successfully processed bulk loan for ${loanData.toolLoans.length} tool loans`)
    } catch (error) {
      console.error(`[v0] Error processing bulk loan:`, error)
    }
  }

  const handleConfirmLoan = async (userId: string, toolId: string, quantity: number, notes: string) => {
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId,
          userId,
          quantity,
          notes,
        }),
      })

      if (!response.ok) {
        throw new Error('Error creating loan')
      }

      console.log(`[v0] Successfully created loan via modal`)
      loadData() // Reload data to reflect changes
    } catch (error) {
      console.error(`[v0] Error creating loan via modal:`, error)
      throw error
    }
  }

  const handleConfirmReturn = async (loanId: string, quantity: number) => {
    try {
      const response = await fetch(`/api/loans/${loanId}/return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnedQuantity: quantity,
        }),
      })

      if (!response.ok) {
        throw new Error('Error returning loan')
      }

      console.log(`[v0] Successfully returned loan via modal`)
      loadData() // Reload data to reflect changes
    } catch (error) {
      console.error(`[v0] Error returning loan via modal:`, error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg shadow-sm">
                <Package className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Sistema de Inventario</h1>
                <p className="text-sm text-muted-foreground">Colegio - Gestión de Herramientas</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {/* Barra de búsqueda */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar herramientas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 w-72 h-11"
                />
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{currentUser?.role}</p>
              </div>
              <Button
                variant="outline"
                size="default"
                className="shadow-sm"
                onClick={() => setShowSettingsModal(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
              <Button variant="outline" size="default" onClick={logout} className="shadow-sm">
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
          <DashboardStats tools={filteredTools} loans={loans} users={users} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group border-0 bg-card" onClick={() => setShowQRScanner(true)}>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-accent rounded-lg group-hover:bg-accent/80 transition-colors">
                  <QrCode className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-card-foreground mb-2">Escanear Código QR</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Para prestar o devolver una herramienta</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group border-0 bg-card" onClick={() => setShowAddToolModal(true)}>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-accent rounded-lg group-hover:bg-accent/80 transition-colors">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-card-foreground mb-2">Agregar Herramienta</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Registrar una nueva herramienta</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group border-0 bg-card" onClick={() => setShowLoansModal(true)}>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-accent rounded-lg group-hover:bg-accent/80 transition-colors">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-card-foreground mb-2">Ver Préstamos</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Gestionar préstamos activos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group border-0 bg-card" onClick={() => setShowBulkLoanModal(true)}>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-accent rounded-lg group-hover:bg-accent/80 transition-colors">
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-card-foreground mb-2">Préstamo Múltiple</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Tomar varias herramientas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Overview - Takes 2 columns */}
          <div className="lg:col-span-2">
            {currentUser && (
              <InventoryOverview
                tools={filteredTools}
                categories={categories}
                loans={loans}
                users={users}
                currentUser={currentUser}
                onToolAction={handleToolAction}
                onConfirmLoan={handleConfirmLoan}
                onConfirmReturn={handleConfirmReturn}
              />
            )}
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
      {scanResult && currentUser && (
        <QRScanResult
          scannedCode={scanResult.code}
          tool={scanResult.tool}
          currentUser={currentUser}
          onAction={handleScanResultAction}
          onBulkLoan={() => setShowBulkLoanModal(true)}
          onClose={() => setScanResult(null)}
          isProcessing={isProcessing}
        />
      )}

      {/* Add Tool Modal */}
      <AddToolModal
        isOpen={showAddToolModal}
        onClose={() => setShowAddToolModal(false)}
        onAddTool={handleAddTool}
        categories={categories}
      />

      {/* Loans Modal */}
      <LoansModal
        isOpen={showLoansModal}
        onClose={() => setShowLoansModal(false)}
        loans={loans}
        tools={tools}
        users={users}
        onReturnTool={handleReturnTool}
      />

      {/* Bulk Loan Modal */}
      <BulkLoanModal
        isOpen={showBulkLoanModal}
        onClose={() => setShowBulkLoanModal(false)}
        tools={filteredTools}
        currentUser={currentUser || undefined}
        onBulkLoan={(selectedTools) => {
          handleBulkLoan(selectedTools)
          setShowBulkLoanModal(false)
        }}
      />

      {/* Settings Modal */}
      {currentUser && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          currentUser={currentUser}
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
