"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, Package, ArrowRight } from "lucide-react"
import type { Tool, Loan, User as UserType } from "@/lib/data"

interface RecentActivityProps {
  tools: Tool[]
  loans: Loan[]
  users: UserType[]
}

export function RecentActivity({ tools, loans, users }: RecentActivityProps) {
  // Generate recent activity from loans and tools
  const recentActivities = [
    ...loans.slice(0, 5).map((loan) => {
      const tool = tools.find((t) => t.id === loan.toolId)
      const user = users.find((u) => u.id === loan.userId)
      return {
        id: loan.id,
        type: loan.status === "active" ? "borrow" : "return",
        tool: tool?.name || "Herramienta desconocida",
        user: user?.name || "Usuario desconocido",
        timestamp: loan.borrowedAt,
        status: loan.status,
      }
    }),
    ...tools.slice(0, 3).map((tool) => ({
      id: `tool-${tool.id}`,
      type: "update" as const,
      tool: tool.name,
      user: "Sistema",
      timestamp: tool.updatedAt,
      status: tool.status,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "borrow":
        return <ArrowRight className="w-4 h-4 text-yellow-600" />
      case "return":
        return <ArrowRight className="w-4 h-4 text-green-600 rotate-180" />
      case "update":
        return <Package className="w-4 h-4 text-blue-600" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case "borrow":
        return `${activity.user} tomó prestado`
      case "return":
        return `${activity.user} devolvió`
      case "update":
        return `Se actualizó`
      default:
        return "Actividad"
    }
  }

  const getActivityBadge = (type: string, status: string) => {
    switch (type) {
      case "borrow":
        return <Badge className="bg-yellow-100 text-yellow-800">Préstamo</Badge>
      case "return":
        return <Badge className="bg-green-100 text-green-800">Devolución</Badge>
      case "update":
        return <Badge className="bg-blue-100 text-blue-800">Actualización</Badge>
      default:
        return <Badge variant="secondary">Actividad</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Actividad Reciente
        </CardTitle>
        <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
              <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">
                    {getActivityText(activity)} <span className="font-semibold">{activity.tool}</span>
                  </p>
                  {getActivityBadge(activity.type, activity.status)}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Avatar className="w-4 h-4">
                    <AvatarFallback className="text-xs">
                      {activity.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-muted-foreground">
                    {activity.user} •{" "}
                    {new Date(activity.timestamp).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {recentActivities.length === 0 && (
            <div className="text-center py-6">
              <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No hay actividad reciente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
