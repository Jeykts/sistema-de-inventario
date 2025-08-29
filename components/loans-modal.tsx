"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, X, Search, Calendar, User, Package } from "lucide-react"
import type { Loan, Tool, User as UserType } from "@/lib/data"

interface LoansModalProps {
  isOpen: boolean
  onClose: () => void
  loans: Loan[]
  tools: Tool[]
  users: UserType[]
  onReturnTool: (loanId: string) => void
}

export function LoansModal({ isOpen, onClose, loans, tools, users, onReturnTool }: LoansModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const getToolName = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId)
    return tool?.name || "Herramienta no encontrada"
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.name || "Usuario no encontrado"
  }

  const getStatusBadge = (status: Loan["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Activo</Badge>
      case "returned":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Devuelto</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Vencido</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const filteredLoans = loans.filter((loan) => {
    const toolName = getToolName(loan.toolId).toLowerCase()
    const userName = getUserName(loan.userId).toLowerCase()
    const matchesSearch = 
      toolName.includes(searchTerm.toLowerCase()) ||
      userName.includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || loan.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const calculateDaysActive = (borrowedAt: string, returnedAt?: string) => {
    const start = new Date(borrowedAt)
    const end = returnedAt ? new Date(returnedAt) : new Date()
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Gestión de Préstamos
              </CardTitle>
              <CardDescription>
                Administra todos los préstamos de herramientas ({filteredLoans.length} de {loans.length})
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por herramienta, usuario o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="returned">Devueltos</SelectItem>
                <SelectItem value="overdue">Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="overflow-auto max-h-[60vh]">
          {filteredLoans.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {loans.length === 0 
                  ? "No hay préstamos registrados" 
                  : "No se encontraron préstamos que coincidan con los filtros"
                }
              </p>
              {searchTerm || statusFilter !== "all" ? (
                <Button
                  variant="outline"
                  className="mt-2 bg-transparent"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                  }}
                >
                  Limpiar filtros
                </Button>
              ) : null}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Herramienta</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prestado</TableHead>
                  <TableHead>Devuelto</TableHead>
                  <TableHead>Días</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-mono text-xs">
                      {loan.id.slice(-6)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{getToolName(loan.toolId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{getUserName(loan.userId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(loan.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        {formatDate(loan.borrowedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {loan.returnedAt ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {formatDate(loan.returnedAt)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {calculateDaysActive(loan.borrowedAt, loan.returnedAt)} días
                      </span>
                    </TableCell>
                    <TableCell>
                      {loan.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReturnTool(loan.id)}
                          className="bg-transparent"
                        >
                          Devolver
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
