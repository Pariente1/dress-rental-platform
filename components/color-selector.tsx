"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { COLOR_OPTIONS, getColorStyle, getColorBorder, type ColorOption } from "@/lib/constants/colors"

// Re-export for backward compatibility
export type { ColorOption }
export { COLOR_OPTIONS }

interface ColorSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ColorSelector({ value, onChange, className }: ColorSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedColor = COLOR_OPTIONS.find((c) => c.name === value) || COLOR_OPTIONS[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn("justify-between h-8", className)}>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{
                ...getColorStyle(selectedColor.name),
                border: `2px solid ${getColorBorder(selectedColor.name) || "#e5e7eb"}`,
              }}
            />
            <span className="text-sm">{selectedColor.name}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="grid gap-1 max-h-64 overflow-y-auto">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color.name}
              onClick={() => {
                onChange(color.name)
                setOpen(false)
              }}
              className={cn(
                "flex items-center gap-3 w-full px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors",
                value === color.name && "bg-accent",
              )}
            >
              <div
                className="w-5 h-5 rounded-full flex-shrink-0"
                style={{
                  ...getColorStyle(color.name),
                  border: `2px solid ${getColorBorder(color.name) || "#e5e7eb"}`,
                }}
              />
              <span className="flex-1 text-left">{color.name}</span>
              {value === color.name && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
