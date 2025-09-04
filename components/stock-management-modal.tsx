"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Minus, X, AlertCircle, CheckCircle, Package } from "lucide-react"
import type { Tool } from "@/lib/data"

interface StockManagementModalProps {
  isOpen: boolean
  onClose: () => void
  tool: Tool | null
  onUpdateStock: (toolId: string, newQuantity: number, newAvailableQuantity: number) => void
}

export function StockManagementModal({
  isOpen,
  onClose,
  tool,
  onUpdateStock
}: StockManagementModalProps) {
  const [quantityToAdd, setQuantityToAdd] = useState("")
  const [quantityToRemove, setQuantityToRemove] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleAddStock = async () => {
    if (!tool) return

    const addAmount = parseInt(quantityToAdd)
    if (!addAmount || addAmount <= 0) {
      setError("Ingresa una cantidad válida para añadir")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const newQuantity = tool.quantity + addAmount
      const newAvailableQuantity = tool.availableQuantity + addAmount

      await onUpdateStock(tool.id, newQuantity, newAvailableQuantity)
      setSuccess(true)
      setQuantityToAdd("")

      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1500)
    } catch (err) {
      setError("Error al actualizar el stock. Inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveStock = async () => {
    if (!tool) return

    const removeAmount = parseInt(quantityToRemove)
    if (!removeAmount || removeAmount <= 0) {
      setError("Ingresa una cantidad válida para remover")
      return
    }

    if (removeAmount > tool.availableQuantity) {
      setError("No puedes remover más unidades de las disponibles")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const newQuantity = tool.quantity - removeAmount
      const newAvailableQuantity = tool.availableQuantity - removeAmount

      await onUpdateStock(tool.id, newQuantity, newAvailableQuantity)
      setSuccess(true)
      setQuantityToRemove("")

      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1500)
    } catch (err) {
      setError("Error al actualizar el stock. Inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setError("")
    if (field === "add") {
      setQuantityToAdd(value)
    } else {
      setQuantityToRemove(value)
    }
  }

  if (!isOpen || !tool) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Gestionar Stock
              </CardTitle>
              <CardDescription>
                {tool.name}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ¡Stock actualizado exitosamente!
              </AlertDescription>
            </Alert>
          )}

          {/* Información actual del stock */}
          <div className="bg-muted/50 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-2">Stock Actual</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium ml-2">{tool.quantity}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Disponible:</span>
                <span className="font-medium ml-2">{tool.availableQuantity}</span>
              </div>
            </div>
          </div>

          {/* Añadir stock */}
          <div className="space-y-4 mb-6">
            <h3 className="font-medium">Añadir Stock</h3>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                value={quantityToAdd}
                onChange={(e) => handleInputChange("add", e.target.value)}
                placeholder="Cantidad"
                disabled={isSubmitting}
                className="flex-1"
              />
              <Button
                onClick={handleAddStock}
                disabled={isSubmitting || !quantityToAdd}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Añadir
              </Button>
            </div>
          </div>

          {/* Remover stock */}
          <div className="space-y-4">
            <h3 className="font-medium">Remover Stock</h3>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                max={tool.availableQuantity}
                value={quantityToRemove}
                onChange={(e) => handleInputChange("remove", e.target.value)}
                placeholder="Cantidad"
                disabled={isSubmitting}
                className="flex-1"
              />
              <Button
                onClick={handleRemoveStock}
                disabled={isSubmitting || !quantityToRemove}
                variant="destructive"
              >
                <Minus className="w-4 h-4 mr-1" />
                Remover
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Solo puedes remover unidades disponibles (máx. {tool.availableQuantity})
            </p>
          </div>

          <div className="flex gap-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-transparent"
            >
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
