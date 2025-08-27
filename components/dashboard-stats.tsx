"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Package, Users, CheckCircle, AlertTriangle, Clock, TrendingUp } from "lucide-react"
import type { Tool, Loan, User } from "@/lib/data"

interface DashboardStatsProps {
  tools: Tool[]
  loans: Loan[]
  users: User[]
}

export function DashboardStats({ tools, loans, users }: DashboardStatsProps) {
  const availableTools = tools.filter((tool) => tool.status === "available")
  const borrowedTools = tools.filter((tool) => tool.status === "borrowed")
  const maintenanceTools = tools.filter((tool) => tool.status === "maintenance")
  const activeLoans = loans.filter((loan) => loan.status === "active")

  // Calculate utilization rate
  const utilizationRate = tools.length > 0 ? (borrowedTools.length / tools.length) * 100 : 0

  // Calculate category distribution
  const categoryStats = tools.reduce(
    (acc, tool) => {
      acc[tool.category] = (acc[tool.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topCategory = Object.entries(categoryStats).sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Tools */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Herramientas</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{tools.length}</div>
          <p className="text-xs text-muted-foreground">
            +{tools.filter((t) => new Date(t.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} este
            mes
          </p>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{availableTools.length}</div>
          <p className="text-xs text-muted-foreground">
            {((availableTools.length / tools.length) * 100).toFixed(1)}% del inventario
          </p>
        </CardContent>
      </Card>

      {/* Borrowed Tools */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En Préstamo</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{borrowedTools.length}</div>
          <div className="flex items-center space-x-2 mt-1">
            <Progress value={utilizationRate} className="flex-1 h-2" />
            <span className="text-xs text-muted-foreground">{utilizationRate.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Tools */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mantenimiento</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{maintenanceTools.length}</div>
          <p className="text-xs text-muted-foreground">Requieren atención</p>
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{users.length}</div>
          <p className="text-xs text-muted-foreground">
            {users.filter((u) => u.role === "profesor").length} profesores,{" "}
            {users.filter((u) => u.role === "admin").length} admin
          </p>
        </CardContent>
      </Card>

      {/* Top Category */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categoría Principal</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-primary">{topCategory?.[1] || 0}</div>
          <p className="text-xs text-muted-foreground truncate">{topCategory?.[0] || "Sin categorías"}</p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{activeLoans.length}</div>
          <p className="text-xs text-muted-foreground">En curso actualmente</p>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800">Operativo</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Todos los sistemas funcionando</p>
        </CardContent>
      </Card>
    </div>
  )
}
