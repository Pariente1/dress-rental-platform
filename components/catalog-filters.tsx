"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { getColorStyle, getColorBorder, sortColorsByPreference } from "@/lib/constants/colors"

interface ColorOption {
  id: string
  name: string
  hex_code: string
  display_name: string
}

interface SizeOption {
  id: string
  name: string
  display_order: number
}

interface CategoryOption {
  id: string
  name: string
  display_name: string
}

export function CatalogFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "todos")
  const [color, setColor] = useState(searchParams.get("color") || "todos")
  const [size, setSize] = useState(searchParams.get("size") || "todos")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")

  const [colors, setColors] = useState<ColorOption[]>([])
  const [sizes, setSizes] = useState<SizeOption[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [isColorPopoverOpen, setIsColorPopoverOpen] = useState(false)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch("/api/get-dress-options")
        const data = await response.json()
        if (data.colors) {
          setColors(sortColorsByPreference(data.colors))
        }
        if (data.sizes) setSizes(data.sizes)
        if (data.categories) setCategories(data.categories)
      } catch (error) {
        console.error("[v0] Error loading filter options:", error)
      } finally {
        setIsLoadingOptions(false)
      }
    }
    fetchOptions()
  }, [])

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (searchQuery) params.set("search", searchQuery)
    if (category && category !== "todos") params.set("category", category)
    if (color && color !== "todos") params.set("color", color)
    if (size && size !== "todos") params.set("size", size)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)

    router.push(`/catalogo?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setCategory("todos")
    setColor("todos")
    setSize("todos")
    setMinPrice("")
    setMaxPrice("")
    router.push("/catalogo")
  }

  const hasActiveFilters =
    searchQuery ||
    (category && category !== "todos") ||
    (color && color !== "todos") ||
    (size && size !== "todos") ||
    minPrice ||
    maxPrice

  const ColorDropdown = ({ isMobile }: { isMobile: boolean }) => {
    const selectedColorName = colors.find((c) => c.name === color)?.display_name || "Todos los colores"
    const selectedColorStyle = color !== "todos" ? getColorStyle(color) : {}

    return isMobile ? (
      // Mobile: Use standard Select
      <Select value={color} onValueChange={setColor}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los colores</SelectItem>
          {colors.map((c) => (
            <SelectItem key={c.id} value={c.name}>
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full border flex-shrink-0"
                  style={{
                    ...getColorStyle(c.name),
                    borderColor: getColorBorder(c.name),
                  }}
                />
                {c.display_name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : (
      // Desktop: Use Popover for better color rendering
      <Popover open={isColorPopoverOpen} onOpenChange={setIsColorPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[180px] justify-between bg-transparent">
            <span className="flex items-center gap-2">
              {color !== "todos" && (
                <span
                  className="h-3 w-3 rounded-full border flex-shrink-0"
                  style={{
                    ...getColorStyle(color),
                    borderColor: getColorBorder(color),
                  }}
                />
              )}
              {selectedColorName}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-3" align="start">
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {/* All Colors option */}
            <button
              onClick={() => {
                setColor("todos")
                setIsColorPopoverOpen(false)
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors ${
                color === "todos" ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"
              }`}
            >
              Todos los colores
            </button>

            {/* Color options */}
            {colors.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setColor(c.name)
                  setIsColorPopoverOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors ${
                  color === c.name ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"
                }`}
              >
                <span
                  className="h-5 w-5 rounded-full border flex-shrink-0"
                  style={{
                    ...getColorStyle(c.name),
                    borderColor: getColorBorder(c.name),
                    borderWidth: "2px",
                  }}
                />
                {c.display_name}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar vestidos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="pl-9"
          />
        </div>

        {/* Mobile Filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden bg-transparent">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las categorías</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <ColorDropdown isMobile={true} />
              </div>

              <div className="space-y-2">
                <Label>Talla</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las tallas</SelectItem>
                    {sizes.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rango de Precio</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  Aplicar Filtros
                </Button>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden gap-4 lg:flex">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ColorDropdown isMobile={false} />

        <Select value={size} onValueChange={setSize}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Talla" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las tallas</SelectItem>
            {sizes.map((s) => (
              <SelectItem key={s.id} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Precio mín"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-[120px]"
          />
          <Input
            type="number"
            placeholder="Precio máx"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-[120px]"
          />
        </div>

        <Button onClick={applyFilters}>Buscar</Button>

        {hasActiveFilters && (
          <Button onClick={clearFilters} variant="outline">
            <X className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}
