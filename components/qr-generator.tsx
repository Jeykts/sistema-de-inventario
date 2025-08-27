"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Download, Copy, CheckCircle } from "lucide-react"
import { useState } from "react"

interface QRGeneratorProps {
  toolId: string
  toolName: string
  qrCode: string
  onClose: () => void
}

export function QRGenerator({ toolId, toolName, qrCode, onClose }: QRGeneratorProps) {
  const [copied, setCopied] = useState(false)

  // Generate QR code URL (using a QR code API service)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("[v0] Failed to copy to clipboard:", err)
    }
  }

  const downloadQR = () => {
    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `QR-${qrCode}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Código QR
              </CardTitle>
              <CardDescription>Código QR para {toolName}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <img src={qrCodeUrl || "/placeholder.svg"} alt={`QR Code for ${qrCode}`} className="w-48 h-48" />
            </div>
          </div>

          {/* Tool Information */}
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">{toolName}</h3>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="font-mono">
                {qrCode}
              </Badge>
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Instrucciones:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Imprime este código QR y pégalo en la herramienta</li>
              <li>• Los usuarios pueden escanear el código para préstamos</li>
              <li>• El código también sirve para devoluciones</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={downloadQR} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
