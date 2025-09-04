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

interface InventoryOverviewProps {
  tools: Tool[]
  categories: Category[]
  loans: Loan[]
  users: UserType[]
  onToolAction: (toolId: string, action: "borrow" | "return" | "maintenance" | "edit" | "delete") => void
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
  onToolAction,
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
      case "available":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Disponible</Badge>
      case "borrowed":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Prestado</Badge>
      case "maintenance":
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
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="borrowed">Prestado</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{tool.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">{tool.description}</CardDescription>
                  </div>
                  {getStatusBadge(tool.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Categoría:</span>
                    <Badge className={getCategoryColor(tool.category)} variant="secondary">
                      {tool.category}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Código QR:</span>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{tool.qrCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ubicación:</span>
                    <span className="font-medium text-xs">{tool.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stock:</span>
                    <span className="font-medium text-xs">
                      {tool.availableQuantity}/{tool.quantity} disponible{tool.availableQuantity !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Actualizado:</span>
                    <span className="text-xs">{new Date(tool.updatedAt).toLocaleDateString("es-ES")}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
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
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => onToolAction(tool.id, "edit")}
                  >
                    <QrCode className="w-3 h-3 mr-1" />
                    QR
                  </Button>

                  {tool.status === "available" && (
                    <Button size="sm" className="flex-1" onClick={() => onToolAction(tool.id, "borrow")}>
                      Prestar
                    </Button>
                  )}

                  {tool.status === "borrowed" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setSelectedToolForReturn(tool)
                        setReturnModalOpen(true)
                      }}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Devolver
                    </Button>
                  )}

                  {tool.status === "maintenance" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => onToolAction(tool.id, "edit")}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                  )}
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
        onConfirmLoan={(loanData) => {
          if (onBulkLoan) {
            onBulkLoan(loanData)
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
    </Card>
  )
}
