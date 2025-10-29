"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Users,
  Tag,
  User,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Database,
  Shield,
  Palette
} from "lucide-react"
import type { User as UserType, Category } from "@/lib/data"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: UserType
}

interface SystemSettings {
  appName: string
  appDescription: string
  allowRegistration: boolean
  requireApproval: boolean
  maxLoanDays: number
  emailNotifications: boolean
}

export function SettingsModal({ isOpen, onClose, currentUser }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("users")

  // User Management State
  const [users, setUsers] = useState<UserType[]>([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [userForm, setUserForm] = useState({
    name: "",
    lastName: "",
    email: "",
    course: "",
    role: "profesor" as "admin" | "profesor"
  })

  // Category Management State
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    color: "#3b82f6"
  })

  // System Settings State
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    appName: "Sistema de Inventario",
    appDescription: "Colegio - Gestión de Herramientas",
    allowRegistration: false,
    requireApproval: true,
    maxLoanDays: 30,
    emailNotifications: false
  })

  // Profile Settings State
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    course: currentUser?.course || ""
  })

  // Loading and Error States
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (isOpen) {
      loadData()
      if (currentUser) {
        setProfileForm({
          name: currentUser.name,
          lastName: currentUser.lastName || "",
          email: currentUser.email,
          course: currentUser.course || ""
        })
      }
    }
  }, [isOpen, currentUser])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load users
      const usersResponse = await fetch('/api/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }

      // Load categories
      const categoriesResponse = await fetch('/api/categories')
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error loading settings data:', error)
      setError('Error al cargar los datos de configuración')
    } finally {
      setIsLoading(false)
    }
  }

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setError(message)
      setSuccess("")
    } else {
      setSuccess(message)
      setError("")
    }
    setTimeout(() => {
      setError("")
      setSuccess("")
    }, 3000)
  }

  // User Management Functions
  const handleAddUser = async () => {
    if (!userForm.name.trim() || !userForm.email.trim()) {
      showMessage("Nombre y email son obligatorios", true)
      return
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      })

      if (response.ok) {
        showMessage("Usuario agregado exitosamente")
        setShowAddUser(false)
        resetUserForm()
        loadData()
      } else {
        showMessage("Error al agregar usuario", true)
      }
    } catch (error) {
      showMessage("Error al agregar usuario", true)
    }
  }

  const handleEditUser = async () => {
    if (!editingUser || !userForm.name.trim() || !userForm.email.trim()) {
      showMessage("Nombre y email son obligatorios", true)
      return
    }

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      })

      if (response.ok) {
        showMessage("Usuario actualizado exitosamente")
        setEditingUser(null)
        resetUserForm()
        loadData()
      } else {
        showMessage("Error al actualizar usuario", true)
      }
    } catch (error) {
      showMessage("Error al actualizar usuario", true)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showMessage("Usuario eliminado exitosamente")
        loadData()
      } else {
        showMessage("Error al eliminar usuario", true)
      }
    } catch (error) {
      showMessage("Error al eliminar usuario", true)
    }
  }

  const resetUserForm = () => {
    setUserForm({
      name: "",
      lastName: "",
      email: "",
      course: "",
      role: "profesor"
    })
  }

  const startEditUser = (user: UserType) => {
    setEditingUser(user)
    setUserForm({
      name: user.name,
      lastName: user.lastName || "",
      email: user.email,
      course: user.course || "",
      role: user.role
    })
  }

  // Category Management Functions
  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) {
      showMessage("El nombre de la categoría es obligatorio", true)
      return
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      })

      if (response.ok) {
        showMessage("Categoría agregada exitosamente")
        setShowAddCategory(false)
        resetCategoryForm()
        loadData()
      } else {
        showMessage("Error al agregar categoría", true)
      }
    } catch (error) {
      showMessage("Error al agregar categoría", true)
    }
  }

  const handleEditCategory = async () => {
    if (!editingCategory || !categoryForm.name.trim()) {
      showMessage("El nombre de la categoría es obligatorio", true)
      return
    }

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      })

      if (response.ok) {
        showMessage("Categoría actualizada exitosamente")
        setEditingCategory(null)
        resetCategoryForm()
        loadData()
      } else {
        showMessage("Error al actualizar categoría", true)
      }
    } catch (error) {
      showMessage("Error al actualizar categoría", true)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta categoría?")) return

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showMessage("Categoría eliminada exitosamente")
        loadData()
      } else {
        showMessage("Error al eliminar categoría", true)
      }
    } catch (error) {
      showMessage("Error al eliminar categoría", true)
    }
  }

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      description: "",
      color: "#3b82f6"
    })
  }

  const startEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      description: category.description,
      color: category.color
    })
  }

  // System Settings Functions
  const handleSaveSystemSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(systemSettings)
      })

      if (response.ok) {
        showMessage("Configuración del sistema guardada exitosamente")
      } else {
        showMessage("Error al guardar configuración", true)
      }
    } catch (error) {
      showMessage("Error al guardar configuración", true)
    }
  }

  // Profile Settings Functions
  const handleSaveProfile = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      showMessage("Nombre y email son obligatorios", true)
      return
    }

    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      })

      if (response.ok) {
        showMessage("Perfil actualizado exitosamente")
      } else {
        showMessage("Error al actualizar perfil", true)
      }
    } catch (error) {
      showMessage("Error al actualizar perfil", true)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración del Sistema
          </DialogTitle>
          <DialogDescription>
            Gestiona usuarios, categorías y configuraciones del sistema
          </DialogDescription>
        </DialogHeader>

        {(error || success) && (
          <Alert variant={error ? "destructive" : "default"}>
            {error ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{error || success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Categorías
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Sistema
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Avanzado
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gestión de Usuarios</CardTitle>
                      <CardDescription>Administra los usuarios del sistema</CardDescription>
                    </div>
                    <Button onClick={() => setShowAddUser(true)} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Usuario
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Curso</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name} {user.lastName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                              {user.role === "admin" ? "Administrador" : "Profesor"}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.course || "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditUser(user)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {user.id !== currentUser.id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Add/Edit User Form */}
              {(showAddUser || editingUser) && (
                <Card>
                  <CardHeader>
                    <CardTitle>{editingUser ? "Editar Usuario" : "Agregar Usuario"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-name">Nombre *</Label>
                        <Input
                          id="user-name"
                          value={userForm.name}
                          onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-lastname">Apellido</Label>
                        <Input
                          id="user-lastname"
                          value={userForm.lastName}
                          onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-email">Email *</Label>
                        <Input
                          id="user-email"
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-course">Curso</Label>
                        <Input
                          id="user-course"
                          value={userForm.course}
                          onChange={(e) => setUserForm(prev => ({ ...prev, course: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-role">Rol</Label>
                      <Select
                        value={userForm.role}
                        onValueChange={(value: "admin" | "profesor") => setUserForm(prev => ({ ...prev, role: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="profesor">Profesor</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={editingUser ? handleEditUser : handleAddUser}>
                        <Save className="w-4 h-4 mr-2" />
                        {editingUser ? "Actualizar" : "Agregar"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddUser(false)
                          setEditingUser(null)
                          resetUserForm()
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gestión de Categorías</CardTitle>
                      <CardDescription>Administra las categorías de herramientas</CardDescription>
                    </div>
                    <Button onClick={() => setShowAddCategory(true)} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Categoría
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.description}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.color}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditCategory(category)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Add/Edit Category Form */}
              {(showAddCategory || editingCategory) && (
                <Card>
                  <CardHeader>
                    <CardTitle>{editingCategory ? "Editar Categoría" : "Agregar Categoría"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category-name">Nombre *</Label>
                      <Input
                        id="category-name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category-description">Descripción</Label>
                      <Textarea
                        id="category-description"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category-color">Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="category-color"
                          type="color"
                          value={categoryForm.color}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                          className="w-16"
                        />
                        <Input
                          value={categoryForm.color}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={editingCategory ? handleEditCategory : handleAddCategory}>
                        <Save className="w-4 h-4 mr-2" />
                        {editingCategory ? "Actualizar" : "Agregar"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddCategory(false)
                          setEditingCategory(null)
                          resetCategoryForm()
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Sistema</CardTitle>
                  <CardDescription>Ajustes generales de la aplicación</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="app-name">Nombre de la Aplicación</Label>
                      <Input
                        id="app-name"
                        value={systemSettings.appName}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, appName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-loan-days">Días Máximos de Préstamo</Label>
                      <Input
                        id="max-loan-days"
                        type="number"
                        value={systemSettings.maxLoanDays}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, maxLoanDays: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="app-description">Descripción</Label>
                    <Textarea
                      id="app-description"
                      value={systemSettings.appDescription}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, appDescription: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Permitir Registro de Usuarios</Label>
                        <p className="text-sm text-muted-foreground">Los usuarios pueden registrarse sin aprobación</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemSettings.allowRegistration}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, allowRegistration: e.target.checked }))}
                        className="rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Requerir Aprobación</Label>
                        <p className="text-sm text-muted-foreground">Los préstamos requieren aprobación de administrador</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemSettings.requireApproval}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, requireApproval: e.target.checked }))}
                        className="rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notificaciones por Email</Label>
                        <p className="text-sm text-muted-foreground">Enviar notificaciones por email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemSettings.emailNotifications}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveSystemSettings} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Configuración
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Perfil</CardTitle>
                  <CardDescription>Actualiza tu información personal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-name">Nombre *</Label>
                      <Input
                        id="profile-name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-lastname">Apellido</Label>
                      <Input
                        id="profile-lastname"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-email">Email *</Label>
                      <Input
                        id="profile-email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-course">Curso</Label>
                      <Input
                        id="profile-course"
                        value={profileForm.course}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, course: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Actualizar Perfil
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración Avanzada</CardTitle>
                  <CardDescription>Herramientas avanzadas para administradores</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Base de Datos</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full">
                          <Database className="w-4 h-4 mr-2" />
                          Respaldar Base de Datos
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Database className="w-4 h-4 mr-2" />
                          Restaurar desde Backup
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Sistema</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full">
                          <Shield className="w-4 h-4 mr-2" />
                          Limpiar Cache
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Palette className="w-4 h-4 mr-2" />
                          Reiniciar Tema
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Estas opciones están disponibles solo para administradores.
                      Use con precaución ya que pueden afectar el funcionamiento del sistema.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
