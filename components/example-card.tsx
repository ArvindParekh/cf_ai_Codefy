'use client'

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ExampleCardProps {
  icon: React.ReactNode
  title: string
  description: string
  code?: string
  content: string
  onClick: (content: string) => void
  className?: string
}

export function ExampleCard({
  icon,
  title,
  description,
  code,
  content,
  onClick,
  className
}: ExampleCardProps) {
  return (
    <Card
      className={cn(
        "group cursor-pointer hover:border-primary/30 hover:bg-muted/50 transition-all duration-200",
        className
      )}
      onClick={() => onClick(content)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {icon}
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>

            {code && (
              <div className="bg-muted/50 rounded px-2 py-1 text-xs font-mono text-muted-foreground border">
                {code}
              </div>
            )}

            <button
              className="text-xs h-7 px-3 py-1 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                onClick(content)
              }}
            >
              Use example
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
