"use client"

import React, { useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Package, User, Clock, Users } from "lucide-react"
import type { Tool, User as UserType } from "@/lib/data"

interface QRScanResultProps {
  scannedCode: string
  tool: Tool | null
  currentUser: UserType
  onAction: (action: "borrow" | "return" | "maintenance") => void
  onBulkLoan?: () => void
  onClose: () => void
  isProcessing: boolean
}

const QRScanResult = React.memo<QRScanResultProps>(function QRScanResult({
  scannedCode,
  tool,
  currentUser,
  onAction,
  onBulkLoan,
  onClose,
  isProcessing
}) {
  // Memoizar la información del estado para evitar cálculos innecesarios
  const statusInfo = useMemo(() => {
    if (!tool) return null

    switch (tool.status) {
      case "AVAILABLE":
        return {
          color: "text-green-600",
          bg: "bg-green-100",
          icon: <CheckCircle className="w-5 h-5" />,
          title: "Herramienta Disponible",
          description: "Esta herramienta está disponible para préstamo",
          actions: ["borrow"],
        }
      case "BORROWED":
        return {
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          icon: <Clock className="w-5 h-5" />,
          title: "Herramienta Prestada",
          description: "Esta herramienta está actualmente en préstamo",
          actions: ["return"],
        }
      case "MAINTENANCE":
        return {
          color: "text-red-600",
          bg: "bg-red-100",
          icon: <AlertCircle className="w-5 h-5" />,
          title: "En Mantenimiento",
          description: "Esta herramienta requiere mantenimiento",
          actions: currentUser.role === "ADMIN" ? ["maintenance"] : [],
        }
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gray-100",
          icon: <Package className="w-5 h-5" />,
          title: "Estado Desconocido",
          description: "Estado de la herramienta no reconocido",
          actions: [],
        }
    }
  }, [tool, currentUser.role])

  // Memoizar las funciones de acción para evitar re-renders
  const handleAction = useCallback((action: "borrow" | "return" | "maintenance") => {
    onAction(action)
  }, [onAction])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const handleBulkLoan = useCallback(() => {
    onBulkLoan?.()
  }, [onBulkLoan])

  // Caso cuando no se encuentra la herramienta
  if (!tool) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="not-found-title">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle id="not-found-title" className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Herramienta No Encontrada
            </CardTitle>
            <CardDescription>El código QR escaneado no corresponde a ninguna herramienta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Código escaneado: {scannedCode}</AlertDescription>
            </Alert>
            <Button onClick={handleClose} className="w-full">
              Cerrar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Función para renderizar botones de acción
  const renderActionButton = (action: string) => {
    switch (action) {
      case "borrow":
        return (
          <Button onClick={() => handleAction("borrow")} disabled={isProcessing} className="flex-1">
            {isProcessing ? "Procesando..." : "Tomar Prestado"}
          </Button>
        )
      case "return":
        return (
          <Button onClick={() => handleAction("return")} disabled={isProcessing} variant="secondary" className="flex-1">
            {isProcessing ? "Procesando..." : "Devolver"}
          </Button>
        )
      case "maintenance":
        return (
          <Button
            onClick={() => handleAction("maintenance")}
            disabled={isProcessing}
            variant="outline"
            className="flex-1 bg-transparent"
          >
            {isProcessing ? "Procesando..." : "Marcar Disponible"}
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="qr-result-title">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle id="qr-result-title" className={`flex items-center gap-2 ${statusInfo?.color}`}>
            {statusInfo?.icon}
            {statusInfo?.title}
          </CardTitle>
          <CardDescription>{statusInfo?.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tool Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Herramienta:</span>
              <span className="font-medium">{tool.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Categoría:</span>
              <Badge variant="secondary">{tool.category}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ubicación:</span>
              <span className="text-sm">{tool.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estado:</span>
              <Badge className={`${statusInfo?.bg} ${statusInfo?.color}`}>
                {tool.status === "AVAILABLE" && "Disponible"}
                {tool.status === "BORROWED" && "Prestado"}
                {tool.status === "MAINTENANCE" && "Mantenimiento"}
              </Badge>
            </div>
          </div>

          {/* User Information */}
          <div className={`p-3 rounded-lg ${statusInfo?.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              <span className="font-medium">Usuario Actual</span>
            </div>
            <div className="text-sm">
              <p>{currentUser.name}</p>
              <p className="text-muted-foreground">{currentUser.email}</p>
              <p className="text-muted-foreground capitalize">Rol: {currentUser.role}</p>
            </div>
          </div>

          {/* Description */}
          {tool.description && (
            <div className="text-sm text-muted-foreground">
              <p>{tool.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex gap-2">
              {statusInfo && statusInfo.actions.length > 0 ? (
                statusInfo.actions.map((action) => (
                  <div key={action}>
                    {renderActionButton(action)}
                  </div>
                ))
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No hay acciones disponibles para esta herramienta.</AlertDescription>
                </Alert>
              )}
              <Button variant="outline" onClick={handleClose} disabled={isProcessing} className="bg-transparent">
                Cancelar
              </Button>
            </div>

            {/* Bulk Loan Button */}
            {onBulkLoan && (
              <Button
                variant="outline"
                onClick={handleBulkLoan}
                disabled={isProcessing}
                className="w-full bg-transparent"
              >
                <Users className="w-4 h-4 mr-2" />
                Préstamo Múltiple
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

export { QRScanResult }
