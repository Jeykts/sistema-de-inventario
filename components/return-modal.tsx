"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Calendar, Package, CheckCircle } from "lucide-react"
import type { Tool, Loan, User as UserType } from "@/lib/data"

interface ReturnModalProps {
  isOpen: boolean
  onClose: () => void
  tool: Tool | null
  loans: Loan[]
  users: UserType[]
  onConfirmReturn: (loanId: string, returnedQuantity: number) => void
}

export function ReturnModal({ isOpen, onClose, tool, loans, users, onConfirmReturn }: ReturnModalProps) {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [returnQuantity, setReturnQuantity] = useState(1)

  // Filtrar préstamos activos para esta herramienta
  const activeLoans = loans?.filter(
    (loan) => loan.toolId === tool?.id && loan.status === "ACTIVE"
  ) || []

  useEffect(() => {
    if (activeLoans.length > 0) {
      setSelectedLoan(activeLoans[0])
      setReturnQuantity(1)
    } else {
      setSelectedLoan(null)
    }
  }, [activeLoans])

  const getUserById = (userId: string) => {
    return users.find((user) => user.id === userId)
  }

  const handleConfirmReturn = async () => {
    if (!selectedLoan) return

    try {
      const response = await fetch(`/api/loans/${selectedLoan.id}/return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnedQuantity: returnQuantity,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al devolver la herramienta')
      }

      onConfirmReturn(selectedLoan.id, returnQuantity)
      onClose()
    } catch (error) {
      console.error('Error:', error)
      // You could show an error message here
    }
  }

  if (!tool) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Devolución de {tool.name}
          </DialogTitle>
          <DialogDescription>
            Seleccione el préstamo y la cantidad a devolver
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la herramienta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información de la Herramienta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Nombre:</span>
                  <p className="font-medium">{tool.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Categoría:</span>
                  <p className="font-medium">{tool.category}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Stock disponible:</span>
                  <p className="font-medium">{tool.availableQuantity}/{tool.quantity}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ubicación:</span>
                  <p className="font-medium">{tool.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de préstamos activos */}
          {activeLoans.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Préstamos Activos</h3>
              {activeLoans.map((loan) => {
                const user = getUserById(loan.userId)
                return (
                  <Card
                    key={loan.id}
                    className={`cursor-pointer transition-colors ${
                      selectedLoan?.id === loan.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedLoan(loan)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 mt-1 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">
                              {user?.name} {user?.lastName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {user?.course}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">
                                Prestado: {new Date(loan.borrowedAt).toLocaleDateString("es-ES")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge variant="secondary" className="mb-2">
                            {loan.quantity} unidades
                          </Badge>
                          {loan.notes && (
                            <p className="text-xs text-muted-foreground max-w-32">
                              {loan.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-700">No hay préstamos activos</h3>
                <p className="text-muted-foreground">
                  Esta herramienta no tiene préstamos pendientes de devolución.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Formulario de devolución */}
          {selectedLoan && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Confirmar Devolución</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Usuario:</span>
                    <span className="font-medium">
                      {getUserById(selectedLoan.userId)?.name} {getUserById(selectedLoan.userId)?.lastName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cantidad prestada:</span>
                    <span className="font-medium">{selectedLoan.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cantidad a devolver:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setReturnQuantity(Math.max(1, returnQuantity - 1))}
                        disabled={returnQuantity <= 1}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center font-medium">{returnQuantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setReturnQuantity(Math.min(selectedLoan.quantity, returnQuantity + 1))}
                        disabled={returnQuantity >= selectedLoan.quantity}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmReturn}
            disabled={!selectedLoan || activeLoans.length === 0}
          >
            Confirmar Devolución
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
