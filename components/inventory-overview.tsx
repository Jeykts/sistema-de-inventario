"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, QrCode, Edit, Package, Users, RotateCcw } from "lucide-react"
import type { Tool, Category, Loan, User as UserType } from "@/lib/data"
import { StockManagementModal } from "./stock-management-modal"
import { BulkLoanModal } from "./bulk-loan-modal"
import { ReturnModal } from "./return-modal"
import { LoanModal } from "./loan-modal"

interface InventoryOverviewProps {
  tools: Tool[]
  categories: Category[]
  loans: Loan[]
  users: UserType[]
  currentUser: UserType
  onToolAction: (toolId: string, action: "borrow" | "return" | "maintenance" | "edit" | "delete") => void
  onConfirmLoan: (userId: string, toolId: string, quantity: number, notes: string) => void
  onConfirmReturn: (loanId: string, quantity: number) => void
  onBulkLoan?: (loanData: {
    userInfo: { name: string; lastName: string; course: string }
    toolLoans: { toolId: string; quantity: number }[]
  }) => void
  onReturn?: (loanId: string, returnedQuantity: number) => void
}

export function InventoryOverview({
  tools,
  categories,
  loans,
  users,
  currentUser,
  onToolAction,
  onConfirmLoan,
  onConfirmReturn,
  onBulkLoan,
  onReturn
}: InventoryOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [selectedToolForStock, setSelectedToolForStock] = useState<Tool | null>(null)
  const [bulkLoanModalOpen, setBulkLoanModalOpen] = useState(false)
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [selectedToolForReturn, setSelectedToolForReturn] = useState<Tool | null>(null)
  const [loanModalOpen, setLoanModalOpen] = useState(false)
  const [selectedToolForLoan, setSelectedToolForLoan] = useState<Tool | null>(null)
  const [loanModalMode, setLoanModalMode] = useState<"borrow" | "return">("borrow")

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || tool.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (status: Tool["status"]) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Disponible</Badge>
      case "BORROWED":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Prestado</Badge>
      case "MAINTENANCE":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Mantenimiento</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    return category?.color || "bg-gray-100 text-gray-800"
  }

  const handleUpdateStock = async (toolId: string, newQuantity: number, newAvailableQuantity: number) => {
    try {
      const response = await fetch(`/api/tools/${toolId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: newQuantity,
          availableQuantity: newAvailableQuantity,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el stock')
      }

      // Aquí podrías actualizar el estado local o recargar los datos
      // Por ahora, simplemente cerramos el modal
      setStockModalOpen(false)
      setSelectedToolForStock(null)

      // Podrías mostrar un mensaje de éxito aquí
      console.log('Stock actualizado exitosamente')
    } catch (error) {
      console.error('Error:', error)
      // Podrías mostrar un mensaje de error aquí
    }
  }

  const handleCloseStockModal = () => {
    setStockModalOpen(false)
    setSelectedToolForStock(null)
  }

  const getActiveLoansForTool = (toolId: string) => {
    return loans.filter(loan =>
      loan.toolId === toolId &&
      loan.status === "ACTIVE"
    ).map(loan => ({
      id: loan.id,
      userId: loan.userId,
      quantity: loan.quantity,
      borrowedAt: loan.borrowedAt,
      notes: loan.notes
    }))
  }

  const handleConfirmLoan = async (userId: string, quantity: number, notes: string) => {
    if (!selectedToolForLoan) return
    await onConfirmLoan(userId, selectedToolForLoan.id, quantity, notes)
  }

  const handleConfirmReturn = async (loanId: string, quantity: number) => {
    await onConfirmReturn(loanId, quantity)
  }

  const handleCloseLoanModal = () => {
    setLoanModalOpen(false)
    setSelectedToolForLoan(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inventario de Herramientas</CardTitle>
            <CardDescription>
              Gestiona y consulta todas las herramientas disponibles ({filteredTools.length} de {tools.length})
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setBulkLoanModalOpen(true)}
              className="bg-transparent"
            >
              <Users className="w-4 h-4 mr-2" />
              Préstamo Múltiple
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, categoría, código QR o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="AVAILABLE">Disponible</SelectItem>
                <SelectItem value="BORROWED">Prestado</SelectItem>
                <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <Card key={tool.id} className="shadow-sm hover:shadow-md transition-all duration-300 border-0 bg-card overflow-hidden">
              <CardContent className="p-0">
                {/* Imagen del herramienta */}
                <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                  <img
                    src={tool.imageUrl || "/placeholder.jpg"}
                    alt={tool.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-card-foreground text-sm leading-tight mb-1 truncate">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-tight line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {getStatusBadge(tool.status)}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Categoría:</span>
                      <Badge className={`${getCategoryColor(tool.category)} text-xs px-2 py-1`} variant="secondary">
                        {tool.category}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Stock:</span>
                      <span className="text-xs font-medium text-card-foreground">
                        {tool.availableQuantity}/{tool.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Botones principales */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedToolForLoan(tool)
                        setLoanModalMode("borrow")
                        setLoanModalOpen(true)
                      }}
                    >
                      Prestar
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setSelectedToolForLoan(tool)
                        setLoanModalMode("return")
                        setLoanModalOpen(true)
                      }}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Devolver
                    </Button>
                  </div>

                  {/* Botón de mantenimiento si está en mantenimiento */}
                  {tool.status === "MAINTENANCE" && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => onToolAction(tool.id, "edit")}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  )}

                  {/* Botones secundarios */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 text-xs"
                      onClick={() => {
                        setSelectedToolForStock(tool)
                        setStockModalOpen(true)
                      }}
                    >
                      <Package className="w-3 h-3 mr-1" />
                      Stock
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 text-xs"
                      onClick={() => onToolAction(tool.id, "edit")}
                    >
                      <QrCode className="w-3 h-3 mr-1" />
                      QR
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron herramientas que coincidan con los filtros.</p>
            <Button
              variant="outline"
              className="mt-2 bg-transparent"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSelectedStatus("all")
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </CardContent>

      {/* Stock Management Modal */}
      <StockManagementModal
        isOpen={stockModalOpen}
        onClose={handleCloseStockModal}
        tool={selectedToolForStock}
        onUpdateStock={handleUpdateStock}
      />

      {/* Bulk Loan Modal */}
      <BulkLoanModal
        isOpen={bulkLoanModalOpen}
        onClose={() => setBulkLoanModalOpen(false)}
        tools={tools}
        onBulkLoan={(selectedTools) => {
          if (onBulkLoan) {
            onBulkLoan(selectedTools)
          }
          setBulkLoanModalOpen(false)
        }}
      />

      {/* Return Modal */}
      <ReturnModal
        isOpen={returnModalOpen}
        onClose={() => {
          setReturnModalOpen(false)
          setSelectedToolForReturn(null)
        }}
        tool={selectedToolForReturn}
        loans={loans}
        users={users}
        onConfirmReturn={(loanId, returnedQuantity) => {
          if (onReturn) {
            onReturn(loanId, returnedQuantity)
          }
          setReturnModalOpen(false)
          setSelectedToolForReturn(null)
        }}
      />

      {/* Loan Modal */}
      <LoanModal
        isOpen={loanModalOpen}
        onClose={handleCloseLoanModal}
        tool={selectedToolForLoan}
        users={users}
        currentUser={currentUser}
        mode={loanModalMode}
        onConfirmLoan={handleConfirmLoan}
        onConfirmReturn={handleConfirmReturn}
        activeLoans={selectedToolForLoan ? getActiveLoansForTool(selectedToolForLoan.id) : []}
      />
    </Card>
  )
}
