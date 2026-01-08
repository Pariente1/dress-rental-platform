"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, CheckCircle2, XCircle, Loader2, ChevronDown, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { getColorStyle, getColorBorder, sortColorsByPreference } from "@/lib/constants/colors"

interface DressColor {
  id: string
  name: string
  hex_code: string
  display_name: string
}

interface DressSize {
  id: string
  name: string
  display_order: number
}

interface DressCategory {
  id: string
  name: string
  display_name: string
}

export function CatalogFiltersHome() {
  const router = useRouter()
  const [size, setSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [minPriceDB, setMinPriceDB] = useState<number>(0)
  const [maxPriceDB, setMaxPriceDB] = useState<number>(1000)
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(1000)
  const [category, setCategory] = useState<string>("")
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false)
  const [eventDate, setEventDate] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null)
  const [showAllColors, setShowAllColors] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)
  const [isDateValid, setIsDateValid] = useState(false)

  const [colors, setColors] = useState<DressColor[]>([])
  const [sizes, setSizes] = useState<DressSize[]>([])
  const [categories, setCategories] = useState<DressCategory[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)

  useEffect(() => {
    const fetchPriceRangeAndOptions = async () => {
      try {
        const supabase = createClient()

        const [priceRes, optionsRes] = await Promise.all([
          supabase.from("dresses").select("price_per_day").eq("available", true),
          fetch("/api/get-dress-options").then((r) => r.json()),
        ])

        const { data: priceData, error: priceError } = priceRes
        if (priceError) throw priceError

        if (priceData && priceData.length > 0) {
          const prices = priceData.map((d) => d.price_per_day)
          const min = Math.floor(Math.min(...prices))
          const max = Math.ceil(Math.max(...prices))
          setMinPriceDB(min)
          setMaxPriceDB(max)
          setMinPrice(min)
          setMaxPrice(max)
        }

        if (optionsRes.colors) {
          const sortedColors = sortColorsByPreference(optionsRes.colors)
          setColors(sortedColors)
        }
        if (optionsRes.sizes) setSizes(optionsRes.sizes)
        if (optionsRes.categories) setCategories(optionsRes.categories)
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
      } finally {
        setIsLoadingOptions(false)
      }
    }
    fetchPriceRangeAndOptions()
  }, [])

  const getMinDate = () => {
    const today = new Date()
    today.setDate(today.getDate() + 2)
    return today.toISOString().split("T")[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 2)
    return maxDate.toISOString().split("T")[0]
  }

  const validateDate = (dateStr: string) => {
    if (!dateStr) {
      setDateError(null)
      setIsDateValid(false)
      return
    }

    const selectedDate = new Date(dateStr + "T00:00:00")
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const minDate = new Date(today)
    minDate.setDate(minDate.getDate() + 2)

    const maxDate = new Date(today)
    maxDate.setFullYear(maxDate.getFullYear() + 2)

    const currentYear = today.getFullYear()

    if (selectedDate < minDate) {
      setDateError("No se pueden consultar vestidos de fechas anteriores al día de hoy")
      setIsDateValid(false)
      return
    }

    if (selectedDate > maxDate) {
      setDateError(`No se pueden consultar vestidos de ${currentYear + 2} o posteriores`)
      setIsDateValid(false)
      return
    }

    setDateError(null)
    setIsDateValid(true)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    setEventDate(newDate)
    setAvailabilityMessage(null)
    validateDate(newDate)
  }

  const handleApplyFilters = () => {
    const params = new URLSearchParams()

    if (size && size !== "all" && size !== "") params.set("size", size)
    if (selectedColor && selectedColor !== "") params.set("color", selectedColor)
    if (minPrice > minPriceDB) params.set("minPrice", minPrice.toString())
    if (maxPrice < maxPriceDB) params.set("maxPrice", maxPrice.toString())
    if (category && category !== "all" && category !== "") params.set("category", category)

    router.push(`/catalogo?${params.toString()}`)
  }

  const handleCheckAvailability = async () => {
    if (!eventDate) {
      setAvailabilityMessage("Por favor selecciona la fecha del evento")
      return
    }

    if (!isDateValid) {
      return
    }

    setIsChecking(true)
    setAvailabilityMessage(null)

    try {
      const response = await fetch("/api/check-available-dresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventDate }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.availableCount > 0) {
          setAvailabilityMessage(`¡Hay ${data.availableCount} vestido(s) disponible(s) para tu evento!`)
          setTimeout(() => {
            router.push(`/catalogo?availableDate=${eventDate}`)
            setAvailabilityModalOpen(false)
          }, 1500)
        } else {
          setAvailabilityMessage("No hay vestidos disponibles para esta fecha")
        }
      } else {
        setAvailabilityMessage(data.error || data.details || "Error al verificar disponibilidad")
      }
    } catch (error) {
      console.error("[v0] Error checking availability:", error)
      setAvailabilityMessage(`Error de conexión: ${error instanceof Error ? error.message : "Intenta de nuevo"}`)
    } finally {
      setIsChecking(false)
    }
  }

  const basicColorCount = 5
  const displayedColors = showAllColors ? colors : colors.slice(0, basicColorCount)

  return (
    <div className="mx-auto mb-10 max-w-6xl rounded-2xl bg-white p-8 shadow-lg">
      <div className="mb-6 text-center">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-600">FILTRAR VESTIDOS</h3>
        <div className="mx-auto h-[2px] w-20 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
      </div>

      <div className="flex flex-wrap items-end justify-center gap-6">
        {/* Talla */}
        <div className="flex-shrink-0">
          <Label className="mb-2 block text-xs font-medium text-gray-600">Talla</Label>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger className="w-32 rounded-full border-gray-300 bg-gray-50 hover:bg-gray-100">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {sizes.map((s) => (
                <SelectItem key={s.id} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Color */}
        <div className="flex-shrink-0">
          <Label className="mb-2 block text-xs font-medium text-gray-600">Color</Label>
          <div className="flex flex-wrap items-center gap-2">
            {displayedColors.map((colorOption) => {
              // Use centralized getColorStyle function
              const colorStyle = getColorStyle(colorOption.name)
              const borderColor =
                selectedColor === colorOption.name ? "#D4AF37" : getColorBorder(colorOption.name) || "#e5e7eb"

              return (
                <button
                  key={colorOption.id}
                  onClick={() => setSelectedColor(selectedColor === colorOption.name ? "" : colorOption.name)}
                  className="h-10 w-10 flex-shrink-0 rounded-full transition-all hover:scale-110"
                  style={{
                    ...colorStyle,
                    border: `3px solid ${borderColor}`,
                    boxShadow: selectedColor === colorOption.name ? "0 0 0 2px #D4AF37" : "none",
                  }}
                  title={colorOption.display_name || colorOption.name}
                  aria-label={`Seleccionar color ${colorOption.display_name || colorOption.name}`}
                />
              )
            })}
            {/* Expand button */}
            {!showAllColors && colors.length > basicColorCount && (
              <button
                onClick={() => setShowAllColors(true)}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-400 bg-gray-100 transition-all hover:scale-110 hover:border-[#D4AF37] hover:bg-gray-200"
                title="Ver más colores"
                aria-label="Ver más colores"
              >
                <Plus className="h-5 w-5 text-gray-600" />
              </button>
            )}
            {/* Collapse button */}
            {showAllColors && (
              <button
                onClick={() => setShowAllColors(false)}
                className="ml-1 text-xs text-gray-500 underline hover:text-gray-700"
              >
                Menos
              </button>
            )}
          </div>
        </div>

        {/* Disponibilidad */}
        <div className="flex-shrink-0">
          <Label className="mb-2 block text-xs font-medium text-gray-600">Disponibilidad</Label>
          <Dialog
            open={availabilityModalOpen}
            onOpenChange={(open) => {
              setAvailabilityModalOpen(open)
              if (!open) {
                setEventDate("")
                setDateError(null)
                setIsDateValid(false)
                setAvailabilityMessage(null)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="h-10 rounded-full border-gray-300 bg-gray-50 hover:bg-gray-100">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm">Por fecha</span>
                <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Verificar Disponibilidad por Fecha</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="availability-date">Fecha del evento</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="availability-date"
                      type="date"
                      value={eventDate}
                      onChange={handleDateChange}
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Las reservas deben hacerse con al menos 2 días de anticipación (máximo 2 años)
                  </p>
                </div>

                {dateError && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{dateError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleCheckAvailability}
                  disabled={isChecking || !eventDate || !isDateValid}
                  className="w-full rounded-full bg-[#D4AF37] text-white hover:bg-[#C49D2E] disabled:opacity-50"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Revisar Disponibilidad"
                  )}
                </Button>

                {availabilityMessage && (
                  <Alert
                    variant={availabilityMessage.includes("disponible(s)") ? "default" : "destructive"}
                    className={
                      availabilityMessage.includes("disponible(s)") ? "border-green-500/50 bg-green-500/10" : ""
                    }
                  >
                    {availabilityMessage.includes("disponible(s)") ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription
                      className={availabilityMessage.includes("disponible(s)") ? "font-semibold text-green-600" : ""}
                    >
                      {availabilityMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Precio */}
        <div className="flex-shrink-0">
          <Label className="mb-2 block text-xs font-medium text-gray-600">
            Precio: ${minPrice} - ${maxPrice}
          </Label>
          <div className="w-56 space-y-2">
            <div className="relative pt-1">
              <input
                type="range"
                min={minPriceDB}
                max={maxPriceDB}
                value={minPrice}
                onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 10))}
                className="range-slider-gold absolute w-full"
                style={{ zIndex: minPrice > maxPrice - 50 ? 2 : 1 }}
              />
              <input
                type="range"
                min={minPriceDB}
                max={maxPriceDB}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 10))}
                className="range-slider-gold w-full"
              />
            </div>
          </div>
        </div>

        {/* Etiqueta */}
        <div className="flex-shrink-0">
          <Label className="mb-2 block text-xs font-medium text-gray-600">Etiqueta</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-36 rounded-full border-gray-300 bg-gray-50 hover:bg-gray-100">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          onClick={handleApplyFilters}
          className="rounded-full bg-[#D4AF37] px-12 py-6 text-base font-semibold text-white shadow-md transition-all hover:bg-[#C49D2E] hover:shadow-lg"
        >
          Aplicar Filtros
        </Button>
      </div>
    </div>
  )
}
