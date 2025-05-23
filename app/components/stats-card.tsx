import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { ReactNode } from "react"

interface StatsCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  description?: ReactNode
  percentage?: number
  trend?: "up" | "down" | "neutral"
}

export default function StatsCard({ title, value, icon, description, percentage, trend }: StatsCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="p-1 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>

        {percentage !== undefined && (
          <div className="mt-2">
            <Progress value={percentage} className="h-1" />
            <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}% del total</p>
          </div>
        )}

        {trend && (
          <div
            className={`flex items-center text-xs mt-2 ${
              trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trend === "neutral" && "→"}
            <span className="ml-1">
              {trend === "up" && "Incremento"}
              {trend === "down" && "Decremento"}
              {trend === "neutral" && "Sin cambios"}
            </span>
          </div>
        )}

        {description && <div className="mt-1">{description}</div>}
      </CardContent>
    </Card>
  )
}
