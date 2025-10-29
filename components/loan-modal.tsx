"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Package, CheckCircle, AlertCircle } from "lucide-react"
import type { Tool, User as UserType } from "@/lib/data"

interface LoanModalProps {
  isOpen: boolean
  onClose: () => void
  tool: Tool | null
  users: UserType[]
  currentUser: UserType
  mode: "borrow" | "return"
  onConfirmLoan: (userId: string, quantity: number, notes: string) => void
  onConfirmReturn: (loanId: string, quantity: number) => void
  activeLoans?: Array<{
    id: string
    userId: string
    quantity: number
    borrowedAt: string
    notes?: string
  }>
}

export function LoanModal({
  isOpen,
  onClose,
  tool,
  users,
  currentUser,
  mode,
  onConfirmLoan,
  onConfirmReturn,
  activeLoans = []
}: LoanModalProps) {
  const [userName, setUserName] = useState("")
  const [userLastName, setUserLastName] = useState("")
  const [userCourse, setUserCourse] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [selectedLoanId, setSelectedLoanId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen && tool) {
      setUserName("")
      setUserLastName("")
      setUserCourse("")
      setQuantity(1)
      setNotes("")
      setSelectedLoanId("")
      setError("")

      // If returning, auto-select the first active loan
      if (mode === "return" && activeLoans.length > 0) {
        setSelectedLoanId(activeLoans[0].id)
        setQuantity(activeLoans[0].quantity)
      }
    }
  }, [isOpen, tool, mode, activeLoans])

  const handleSubmit = async () => {
    if (!tool) return

    setError("")
    setIsSubmitting(true)

    try {
      if (mode === "borrow") {
        if (!userName.trim() || !userLastName.trim()) {
          setError("Debe ingresar nombre y apellido de la persona")
          return
        }

        if (quantity > tool.availableQuantity) {
          setError(`Solo hay ${tool.availableQuantity} unidades disponibles`)
          return
        }

        // Create notes with person information
        const personInfo = `${userName.trim()} ${userLastName.trim()}${userCourse ? ` (${userCourse})` : ''}`
        const fullNotes = notes.trim() ? `${personInfo} - ${notes.trim()}` : personInfo

        await onConfirmLoan(currentUser.id, quantity, fullNotes)
      } else if (mode === "return") {
        if (!selectedLoanId) {
          setError("Debe seleccionar un préstamo para devolver")
          return
        }

        await onConfirmReturn(selectedLoanId, quantity)
      }

      onClose()
    } catch (error) {
      console.error("Error:", error)
      setError("Error al procesar la operación")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getUserById = (userId: string) => {
    return users.find(u => u.id === userId)
  }

  const selectedLoan = activeLoans.find(loan => loan.id === selectedLoanId)

  if (!tool) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {mode === "borrow" ? "Prestar" : "Devolver"} {tool.name}
          </DialogTitle>
          <DialogDescription>
            {mode === "borrow"
              ? "Selecciona el usuario y la cantidad a prestar"
              : "Selecciona el préstamo y la cantidad a devolver"
            }
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Tool Information */}
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

          {mode === "borrow" ? (
            /* Borrow Mode */
            <>
              {/* User Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Información de la Persona</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-name">Nombre *</Label>
                      <Input
                        id="user-name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Ej: Juan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-lastname">Apellido *</Label>
                      <Input
                        id="user-lastname"
                        value={userLastName}
                        onChange={(e) => setUserLastName(e.target.value)}
                        placeholder="Ej: Pérez"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-course">Curso/Grupo</Label>
                    <Input
                      id="user-course"
                      value={userCourse}
                      onChange={(e) => setUserCourse(e.target.value)}
                      placeholder="Ej: 3°A, Profesor Matemáticas"
                    />
                  </div>

                  {(userName || userLastName || userCourse) && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Resumen</span>
                      </div>
                      <div className="text-sm">
                        <p><strong>Persona:</strong> {userName} {userLastName}</p>
                        {userCourse && <p><strong>Curso/Grupo:</strong> {userCourse}</p>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quantity and Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Detalles del Préstamo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad *</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(tool.availableQuantity, parseInt(e.target.value) || 1)))}
                        className="w-20 text-center"
                        min={1}
                        max={tool.availableQuantity}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.min(tool.availableQuantity, quantity + 1))}
                        disabled={quantity >= tool.availableQuantity}
                      >
                        +
                      </Button>
                      <span className="text-sm text-muted-foreground ml-2">
                        Máximo: {tool.availableQuantity}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas (opcional)</Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej: Para proyecto de carpintería"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Return Mode */
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Devoluciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeLoans.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="loan-select">Seleccionar Préstamo a Devolver *</Label>
                      <Select value={selectedLoanId} onValueChange={(loanId) => {
                        setSelectedLoanId(loanId)
                        const loan = activeLoans.find(l => l.id === loanId)
                        if (loan) setQuantity(loan.quantity)
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar préstamo" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeLoans.map((loan) => {
                            const user = getUserById(loan.userId)
                            return (
                              <SelectItem key={loan.id} value={loan.id}>
                                {user?.name} {user?.lastName} - {loan.quantity} unidades ({new Date(loan.borrowedAt).toLocaleDateString("es-ES")})
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedLoan && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">Detalles del Préstamo</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>Usuario:</strong> {getUserById(selectedLoan.userId)?.name} {getUserById(selectedLoan.userId)?.lastName}</p>
                          <p><strong>Cantidad prestada:</strong> {selectedLoan.quantity}</p>
                          <p><strong>Fecha:</strong> {new Date(selectedLoan.borrowedAt).toLocaleDateString("es-ES")}</p>
                          {selectedLoan.notes && <p><strong>Notas:</strong> {selectedLoan.notes}</p>}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="return-quantity">Cantidad a devolver *</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          -
                        </Button>
                        <Input
                          id="return-quantity"
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Math.min(selectedLoan?.quantity || 1, parseInt(e.target.value) || 1)))}
                          className="w-20 text-center"
                          min={1}
                          max={selectedLoan?.quantity || 1}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.min(selectedLoan?.quantity || 1, quantity + 1))}
                          disabled={quantity >= (selectedLoan?.quantity || 1)}
                        >
                          +
                        </Button>
                        <span className="text-sm text-muted-foreground ml-2">
                          Máximo: {selectedLoan?.quantity || 0}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-700">No hay nada para devolver</h3>
                    <p className="text-muted-foreground">
                      Esta herramienta no tiene préstamos pendientes de devolución.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (mode === "return" && activeLoans.length === 0)}
          >
            {isSubmitting ? "Procesando..." : (mode === "borrow" ? "Confirmar Préstamo" : "Confirmar Devolución")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
