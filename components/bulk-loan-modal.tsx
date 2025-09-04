"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, User, BookOpen } from "lucide-react"
import type { Tool, User as UserType } from "@/lib/data"

interface BulkLoanModalProps {
  isOpen: boolean
  onClose: () => void
  tools: Tool[]
  currentUser?: UserType
  onBulkLoan: (selectedTools: Tool[]) => void
}

export function BulkLoanModal({ isOpen, onClose, tools, currentUser, onBulkLoan }: BulkLoanModalProps) {
  const [userInfo, setUserInfo] = useState({
    name: "",
    lastName: "",
    course: "",
  })

  const [toolQuantities, setToolQuantities] = useState<Record<string, number>>({})

  // Inicializar cantidades en 0 para todas las herramientas disponibles
  useEffect(() => {
    if (isOpen) {
      const initialQuantities: Record<string, number> = {}
      tools.forEach((tool) => {
        if (tool.status === "available" && tool.availableQuantity > 0) {
          initialQuantities[tool.id] = 0
        }
      })
      setToolQuantities(initialQuantities)
    }
  }, [isOpen, tools])

  const updateQuantity = (toolId: string, newQuantity: number) => {
    const tool = tools.find((t) => t.id === toolId)
    if (!tool) return

    // Asegurar que la cantidad no sea negativa y no exceda el stock disponible
    const clampedQuantity = Math.max(0, Math.min(newQuantity, tool.availableQuantity))

    setToolQuantities((prev) => ({
      ...prev,
      [toolId]: clampedQuantity,
    }))
  }

  const getSelectedTools = () => {
    return tools.filter((tool) => toolQuantities[tool.id] > 0)
  }

  const getTotalItems = () => {
    return Object.values(toolQuantities).reduce((sum, qty) => sum + qty, 0)
  }

  const handleConfirm = () => {
    const selectedTools = getSelectedTools()
    if (selectedTools.length === 0) {
      alert("Por favor seleccione al menos una herramienta")
      return
    }

    onBulkLoan(selectedTools)

    // Reset form
    setUserInfo({ name: "", lastName: "", course: "" })
    setToolQuantities({})
    onClose()
  }

  const handleClose = () => {
    setUserInfo({ name: "", lastName: "", course: "" })
    setToolQuantities({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Préstamo Múltiple de Herramientas</DialogTitle>
          <DialogDescription>
            Seleccione las herramientas y cantidades que desea tomar prestadas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del Usuario */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Información del Usuario</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ingrese el nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={userInfo.lastName}
                    onChange={(e) => setUserInfo((prev) => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Ingrese el apellido"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Curso</Label>
                  <Input
                    id="course"
                    value={userInfo.course}
                    onChange={(e) => setUserInfo((prev) => ({ ...prev, course: e.target.value }))}
                    placeholder="Ingrese el curso"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selección de Herramientas */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Selección de Herramientas</h3>
                <Badge variant="secondary">{getTotalItems()} items seleccionados</Badge>
              </div>

              <div className="space-y-4">
                {tools
                  .filter((tool) => tool.status === "available" && tool.availableQuantity > 0)
                  .map((tool) => (
                    <div key={tool.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{tool.name}</h4>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{tool.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Disponible: {tool.availableQuantity}/{tool.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(tool.id, toolQuantities[tool.id] - 1)}
                          disabled={toolQuantities[tool.id] <= 0}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>

                        <span className="w-12 text-center font-medium">
                          {toolQuantities[tool.id] || 0}
                        </span>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(tool.id, toolQuantities[tool.id] + 1)}
                          disabled={toolQuantities[tool.id] >= tool.availableQuantity}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Resumen */}
          {getSelectedTools().length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Resumen del Préstamo</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Usuario:</span>
                    <span className="font-medium">
                      {userInfo.name} {userInfo.lastName} - {userInfo.course}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de items:</span>
                    <span className="font-medium">{getTotalItems()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Herramientas seleccionadas:</span>
                    <span className="font-medium">{getSelectedTools().length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={getSelectedTools().length === 0}>
            Confirmar Préstamo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
