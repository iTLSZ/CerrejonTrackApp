import type React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string | React.ReactNode
  percentage?: number
}

export default function StatsCard({ title, value, icon, description, percentage }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>
          {percentage !== undefined && <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>}
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold">{value}</span>
          {description && (
            <div className="mt-1">
              {typeof description === "string" ? (
                <p className="text-xs text-muted-foreground">{description}</p>
              ) : (
                description
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
