"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Package, User, Clock } from "lucide-react"
import type { Tool, User as UserType } from "@/lib/data"

interface QRScanResultProps {
  scannedCode: string
  tool: Tool | null
  currentUser: UserType
  onAction: (action: "borrow" | "return" | "maintenance") => void
  onClose: () => void
  isProcessing: boolean
}

export function QRScanResult({ scannedCode, tool, currentUser, onAction, onClose, isProcessing }: QRScanResultProps) {
  if (!tool) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
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
            <Button onClick={onClose} className="w-full">
              Cerrar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusInfo = () => {
    switch (tool.status) {
      case "available":
        return {
          color: "text-green-600",
          bg: "bg-green-100",
          icon: <CheckCircle className="w-5 h-5" />,
          title: "Herramienta Disponible",
          description: "Esta herramienta está disponible para préstamo",
          actions: ["borrow"],
        }
      case "borrowed":
        return {
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          icon: <Clock className="w-5 h-5" />,
          title: "Herramienta Prestada",
          description: "Esta herramienta está actualmente en préstamo",
          actions: ["return"],
        }
      case "maintenance":
        return {
          color: "text-red-600",
          bg: "bg-red-100",
          icon: <AlertCircle className="w-5 h-5" />,
          title: "En Mantenimiento",
          description: "Esta herramienta requiere mantenimiento",
          actions: currentUser.role === "admin" ? ["maintenance"] : [],
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
  }

  const statusInfo = getStatusInfo()

  const getActionButton = (action: string) => {
    switch (action) {
      case "borrow":
        return (
          <Button onClick={() => onAction("borrow")} disabled={isProcessing} className="flex-1">
            {isProcessing ? "Procesando..." : "Tomar Prestado"}
          </Button>
        )
      case "return":
        return (
          <Button onClick={() => onAction("return")} disabled={isProcessing} variant="secondary" className="flex-1">
            {isProcessing ? "Procesando..." : "Devolver"}
          </Button>
        )
      case "maintenance":
        return (
          <Button
            onClick={() => onAction("maintenance")}
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${statusInfo.color}`}>
            {statusInfo.icon}
            {statusInfo.title}
          </CardTitle>
          <CardDescription>{statusInfo.description}</CardDescription>
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
              <Badge className={statusInfo.bg + " " + statusInfo.color}>
                {tool.status === "available" && "Disponible"}
                {tool.status === "borrowed" && "Prestado"}
                {tool.status === "maintenance" && "Mantenimiento"}
              </Badge>
            </div>
          </div>

          {/* User Information */}
          <div className={`p-3 rounded-lg ${statusInfo.bg}`}>
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
          <div className="flex gap-2">
            {statusInfo.actions.length > 0 ? (
              statusInfo.actions.map((action) => getActionButton(action))
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No hay acciones disponibles para esta herramienta.</AlertDescription>
              </Alert>
            )}
            <Button variant="outline" onClick={onClose} disabled={isProcessing} className="bg-transparent">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
