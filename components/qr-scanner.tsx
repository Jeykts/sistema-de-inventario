"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Camera, X, AlertCircle, Loader2 } from "lucide-react"

interface QRScannerProps {
  onScanResult: (result: string) => void
  onClose: () => void
  isOpen: boolean
}

export function QRScanner({ onScanResult, onClose, isOpen }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>("")
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    try {
      setError("")
      setIsScanning(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera if available
      })

      streamRef.current = stream
      setHasPermission(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // Start scanning for QR codes
      startQRDetection()
    } catch (err) {
      console.error("[v0] Camera access error:", err)
      setError("No se pudo acceder a la cámara. Verifica los permisos.")
      setHasPermission(false)
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const startQRDetection = () => {
    const detectQR = () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(detectQR)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Simple QR detection simulation - in a real app, you'd use a QR detection library
      // For demo purposes, we'll simulate QR detection with a manual input
      requestAnimationFrame(detectQR)
    }

    detectQR()
  }

  const simulateQRScan = (qrCode: string) => {
    onScanResult(qrCode)
    stopCamera()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Escanear Código QR
              </CardTitle>
              <CardDescription>Apunta la cámara hacia el código QR de la herramienta</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hasPermission === null && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Solicitando acceso a la cámara...</p>
            </div>
          )}

          {hasPermission === false && (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-muted-foreground mb-4">No se pudo acceder a la cámara</p>
              <Button onClick={startCamera} variant="outline">
                Intentar de nuevo
              </Button>
            </div>
          )}

          {hasPermission && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  playsInline
                  muted
                  style={{ transform: "scaleX(-1)" }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                  </div>
                </div>

                {isScanning && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Escaneando...
                    </Badge>
                  </div>
                )}
              </div>

              {/* Demo QR codes for testing */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Para demostración, usa estos códigos:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateQRScan("TOOL-001-2024")}
                    className="text-xs bg-transparent"
                  >
                    TOOL-001-2024
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateQRScan("TOOL-002-2024")}
                    className="text-xs bg-transparent"
                  >
                    TOOL-002-2024
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateQRScan("TOOL-003-2024")}
                    className="text-xs bg-transparent"
                  >
                    TOOL-003-2024
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateQRScan("TOOL-004-2024")}
                    className="text-xs bg-transparent"
                  >
                    TOOL-004-2024
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
