"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { Minus, Plus, User, BookOpen, Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Tool, User as UserType } from "@/lib/data"

interface BulkLoanModalProps {
  isOpen: boolean
  onClose: () => void
  tools: Tool[]
  currentUser?: UserType
  onBulkLoan: (loanData: {
    userInfo: { name: string; lastName: string; course: string }
    toolLoans: { toolId: string; quantity: number }[]
  }) => void
}

export function BulkLoanModal({ isOpen, onClose, tools, currentUser, onBulkLoan }: BulkLoanModalProps) {
  const [userInfo, setUserInfo] = useState({
    name: "",
    lastName: "",
    course: "",
  })

  const [toolQuantities, setToolQuantities] = useState<Record<string, number>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Inicializar cantidades en 0 para todas las herramientas disponibles
  useEffect(() => {
    if (isOpen) {
      const initialQuantities: Record<string, number> = {}
      tools.forEach((tool) => {
        if (tool.status === "AVAILABLE" && tool.availableQuantity > 0) {
          initialQuantities[tool.id] = 0
        }
      })
      setToolQuantities(initialQuantities)
      // Reset search and filters
      setSearchTerm("")
      setSelectedCategory("all")
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
    const toolLoans = Object.entries(toolQuantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([toolId, quantity]) => ({ toolId, quantity }))

    if (toolLoans.length === 0) {
      alert("Por favor seleccione al menos una herramienta")
      return
    }

    if (!userInfo.name.trim() || !userInfo.lastName.trim() || !userInfo.course.trim()) {
      alert("Por favor complete toda la información del usuario")
      return
    }

    onBulkLoan({
      userInfo,
      toolLoans
    })

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
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl">Préstamo Múltiple de Herramientas</DialogTitle>
          <CardDescription className="text-lg mt-2">
            Selecciona las herramientas y cantidades que deseas tomar prestadas
          </CardDescription>
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

              {/* Filtros y búsqueda */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex items-center space-x-2 flex-1">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar herramientas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {Array.from(new Set(tools.map(tool => tool.category))).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                {tools
                  .filter((tool) => {
                    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          tool.description?.toLowerCase().includes(searchTerm.toLowerCase())
                    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory
                    const isAvailable = tool.status === "AVAILABLE" && tool.availableQuantity > 0
                    return matchesSearch && matchesCategory && isAvailable
                  })
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
