"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, X, AlertCircle, CheckCircle, Upload, Image } from "lucide-react"
import type { Tool, Category } from "@/lib/data"

interface AddToolModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTool: (tool: Omit<Tool, "id" | "createdAt" | "updatedAt">) => void
  categories: Category[]
}

export function AddToolModal({ isOpen, onClose, onAddTool, categories }: AddToolModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    qrCode: "",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateQRCode = () => {
    const timestamp = Date.now()
    const randomNum = Math.floor(Math.random() * 1000)
    const qrCode = `TOOL-${randomNum.toString().padStart(3, '0')}-${new Date().getFullYear()}`
    setFormData(prev => ({ ...prev, qrCode }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Validaciones
    if (!formData.name.trim()) {
      setError("El nombre de la herramienta es obligatorio")
      setIsSubmitting(false)
      return
    }

    if (!formData.category) {
      setError("Debe seleccionar una categoría")
      setIsSubmitting(false)
      return
    }

    if (!formData.location.trim()) {
      setError("La ubicación es obligatoria")
      setIsSubmitting(false)
      return
    }

    if (!formData.qrCode.trim()) {
      setError("Debe generar un código QR")
      setIsSubmitting(false)
      return
    }

    try {
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newTool: Omit<Tool, "id" | "createdAt" | "updatedAt"> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        location: formData.location.trim(),
        qrCode: formData.qrCode.trim(),
        status: "AVAILABLE",
        quantity: 1,
        availableQuantity: 1
      }

      onAddTool(newTool)
      setSuccess(true)

      // Resetear formulario después de éxito
      setTimeout(() => {
        setFormData({
          name: "",
          description: "",
          category: "",
          location: "",
          qrCode: "",
        })
        setSuccess(false)
        onClose()
      }, 1500)

    } catch (err) {
      setError("Error al agregar la herramienta. Inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("") // Limpiar error al escribir
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Agregar Herramienta
              </CardTitle>
              <CardDescription>Registra una nueva herramienta en el inventario</CardDescription>
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
                ¡Herramienta agregada exitosamente!
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Herramienta *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ej: Taladro Eléctrico Bosch"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descripción detallada de la herramienta..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Ej: Taller A - Estante 1"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qrCode">Código QR *</Label>
              <div className="flex gap-2">
                <Input
                  id="qrCode"
                  value={formData.qrCode}
                  onChange={(e) => handleInputChange("qrCode", e.target.value)}
                  placeholder="TOOL-XXX-2024"
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateQRCode}
                  disabled={isSubmitting}
                >
                  Generar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                El código QR debe ser único para cada herramienta
              </p>
            </div>

            <div className="space-y-2">
              <Label>Imagen de la Herramienta</Label>
              <div className="space-y-2">
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setSelectedImage(null)
                        setImagePreview(null)
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedImage ? "Cambiar Imagen" : "Subir Imagen"}
                  </Button>
                  {selectedImage && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedImage(null)
                        setImagePreview(null)
                      }}
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setSelectedImage(file)
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        setImagePreview(e.target?.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Agregando..." : "Agregar Herramienta"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-transparent"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
