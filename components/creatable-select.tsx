"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Check, ChevronDown, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface CreatableSelectProps {
  value: string | string[]
  onChange: (value: string | string[]) => void
  options: string[]
  onOptionsChange?: (options: string[]) => void
  placeholder?: string
  multiple?: boolean
  allowCreate?: boolean
  allowDelete?: boolean
  className?: string
}

export function CreatableSelect({
  value,
  onChange,
  options: initialOptions,
  onOptionsChange,
  placeholder = "Seleccionar...",
  multiple = false,
  allowCreate = true,
  allowDelete = true,
  className,
}: CreatableSelectProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState(initialOptions)
  const [newOption, setNewOption] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setOptions(initialOptions)
  }, [initialOptions])

  const selectedValues = multiple ? (Array.isArray(value) ? value : [value].filter(Boolean)) : [value].filter(Boolean)

  const handleSelect = (option: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [value].filter(Boolean)
      if (currentValues.includes(option)) {
        onChange(currentValues.filter((v) => v !== option))
      } else {
        onChange([...currentValues, option])
      }
    } else {
      onChange(option)
      setOpen(false)
    }
  }

  const handleAddOption = () => {
    const trimmed = newOption.trim()
    if (trimmed && !options.includes(trimmed)) {
      const newOptions = [...options, trimmed]
      setOptions(newOptions)
      onOptionsChange?.(newOptions)
      handleSelect(trimmed)
      setNewOption("")
    }
  }

  const handleDeleteOption = (optionToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newOptions = options.filter((o) => o !== optionToDelete)
    setOptions(newOptions)
    onOptionsChange?.(newOptions)

    // Remove from selected if it was selected
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((v) => v !== optionToDelete))
    } else if (value === optionToDelete) {
      onChange("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((v) => v !== tag))
    }
  }

  const displayValue = multiple
    ? selectedValues.length > 0
      ? `${selectedValues.length} seleccionado(s)`
      : placeholder
    : value || placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between h-auto min-h-8 text-left", className)}
        >
          {multiple && selectedValues.length > 0 ? (
            <div className="flex flex-wrap gap-1 py-1">
              {selectedValues.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                  {tag}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveTag(tag)
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <span className={cn("text-sm", !value && "text-muted-foreground")}>{displayValue}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        {allowCreate && (
          <div className="flex gap-2 mb-2 pb-2 border-b">
            <Input
              ref={inputRef}
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Nueva opción..."
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddOption()
                }
              }}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2 bg-transparent"
              onClick={handleAddOption}
              disabled={!newOption.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="grid gap-1 max-h-48 overflow-auto">
          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">No hay opciones</p>
          ) : (
            options.map((option) => (
              <div
                key={option}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors cursor-pointer group",
                  selectedValues.includes(option) && "bg-accent",
                )}
                onClick={() => handleSelect(option)}
              >
                <div
                  className={cn(
                    "w-4 h-4 border rounded flex items-center justify-center flex-shrink-0",
                    selectedValues.includes(option) ? "bg-primary border-primary" : "border-input",
                  )}
                >
                  {selectedValues.includes(option) && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <span className="flex-1 text-left">{option}</span>
                {allowDelete && (
                  <button
                    onClick={(e) => handleDeleteOption(option, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
