"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DressCard } from "@/components/dress-card"
import type { Dress } from "@/types/dress"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface CatalogContentProps {
  editMode: boolean
}

export function CatalogContent({ editMode }: CatalogContentProps) {
  const searchParams = useSearchParams()
  const [dresses, setDresses] = useState<Dress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hasFetched = useRef(false)
  const lastParamsRef = useRef<string>("")

  const fetchDresses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()

      let query = supabase.from("dresses").select("*").eq("available", true)

      const search = searchParams.get("search")
      const category = searchParams.get("category")
      const color = searchParams.get("color")
      const size = searchParams.get("size")
      const minPrice = searchParams.get("minPrice")
      const maxPrice = searchParams.get("maxPrice")
      const availableDate = searchParams.get("availableDate")

      if (search && search.trim() !== "") {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (category && !["todos", "all", "todas", ""].includes(category.toLowerCase())) {
        query = query.ilike("category", `%${category}%`)
      }

      if (color && !["todos", "all", "todas", ""].includes(color.toLowerCase())) {
        if (color.toLowerCase() === "multicolor") {
          query = query.or("color.ilike.%multi%,color.ilike.%varios%,color.ilike.%arcoiris%")
        } else {
          query = query.ilike("color", `%${color}%`)
        }
      }

      if (size && !["todos", "all", "todas", ""].includes(size.toLowerCase())) {
        query = query.eq("size", size)
      }

      if (minPrice && minPrice !== "" && !isNaN(Number(minPrice))) {
        query = query.gte("price_per_day", Number(minPrice))
      }

      if (maxPrice && maxPrice !== "" && !isNaN(Number(maxPrice))) {
        query = query.lte("price_per_day", Number(maxPrice))
      }

      if (availableDate) {
        const eventDate = new Date(availableDate + "T00:00:00")
        const pickupDate = new Date(eventDate)
        pickupDate.setDate(pickupDate.getDate() - 2)
        const returnDate = new Date(eventDate)
        returnDate.setDate(returnDate.getDate() + 1)

        const { data: reservations, error: reservationError } = await supabase
          .from("reservations")
          .select("dress_id")
          .gte("return_date", pickupDate.toISOString().split("T")[0])
          .lte("pickup_date", returnDate.toISOString().split("T")[0])
          .eq("status", "confirmed")

        if (reservationError) {
          throw new Error(`Error checking reservations: ${reservationError.message}`)
        }

        if (reservations && reservations.length > 0) {
          const reservedIds = reservations.map((r) => r.dress_id)
          query = query.not("id", "in", `(${reservedIds.join(",")})`)
        }
      }

      const { data, error: queryError } = await query.order("created_at", { ascending: false })

      if (queryError) {
        throw new Error(`Database Error: ${queryError.message} (Code: ${queryError.code || "unknown"})`)
      }

      setDresses(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(`No se pudo cargar el catálogo. ${errorMessage}. Intente más tarde.`)
      setDresses([])
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    const currentParams = searchParams.toString()

    if (!hasFetched.current || currentParams !== lastParamsRef.current) {
      hasFetched.current = true
      lastParamsRef.current = currentParams
      fetchDresses()
    }
  }, [searchParams, fetchDresses])

  const handleDressUpdate = (updatedDress: Dress) => {
    setDresses((prev) => prev.map((d) => (d.id === updatedDress.id ? updatedDress : d)))
  }

  const handleDressDelete = (dressId: string) => {
    setDresses((prev) => prev.filter((d) => d.id !== dressId))
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center px-4">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">Error de Conexión</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">{error}</p>
            <Button onClick={() => fetchDresses()} variant="outline" size="sm">
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <>
      {dresses && dresses.length > 0 ? (
        <>
          <p className="mb-6 text-muted-foreground">
            {dresses.length} {dresses.length === 1 ? "vestido encontrado" : "vestidos encontrados"}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dresses.map((dress: Dress) => (
              <DressCard
                key={dress.id}
                dress={dress}
                editMode={editMode}
                onUpdate={handleDressUpdate}
                onDelete={handleDressDelete}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="mb-2 text-lg font-semibold text-foreground">No se encontraron vestidos</p>
            <p className="text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
          </div>
        </div>
      )}
    </>
  )
}
