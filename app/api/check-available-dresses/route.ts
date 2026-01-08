import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { eventDate } = await request.json()

    if (!eventDate) {
      return NextResponse.json({ error: "Fecha del evento es requerida" }, { status: 400 })
    }

    const selectedDate = new Date(eventDate + "T00:00:00")
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const minDate = new Date(today)
    minDate.setDate(minDate.getDate() + 2)

    const maxDate = new Date(today)
    maxDate.setFullYear(maxDate.getFullYear() + 2)

    if (selectedDate < minDate) {
      return NextResponse.json({
        availableCount: 0,
        error: "No se pueden consultar vestidos de fechas anteriores al día de hoy",
      })
    }

    if (selectedDate > maxDate) {
      const currentYear = today.getFullYear()
      return NextResponse.json({
        availableCount: 0,
        error: `No se pueden consultar vestidos de ${currentYear + 2} o posteriores`,
      })
    }

    let supabase
    try {
      supabase = await createClient()
    } catch (clientError) {
      console.error("[v0] SUPABASE_CLIENT_ERROR:", clientError)
      return NextResponse.json(
        {
          error: "Error de conexión a base de datos",
          details: clientError instanceof Error ? clientError.message : "Unknown",
        },
        { status: 500 },
      )
    }

    // Calcular las fechas de inicio y fin (2 días antes y 1 día después)
    const pickupDate = new Date(eventDate + "T00:00:00")
    pickupDate.setDate(pickupDate.getDate() - 2)

    const returnDate = new Date(eventDate + "T00:00:00")
    returnDate.setDate(returnDate.getDate() + 1)

    // Obtener todos los vestidos disponibles
    const { data: allDresses, error: dressesError } = await supabase.from("dresses").select("id").eq("available", true)

    if (dressesError) {
      console.error("[v0] DRESSES_ERROR:", dressesError)
      return NextResponse.json(
        {
          error: "Error al obtener vestidos",
          details: dressesError.message,
          code: dressesError.code,
        },
        { status: 500 },
      )
    }

    if (!allDresses || allDresses.length === 0) {
      return NextResponse.json({ availableCount: 0, message: "No hay vestidos en el catálogo" })
    }

    // Verificar cuántos vestidos están disponibles para las fechas
    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select("dress_id")
      .gte("return_date", pickupDate.toISOString().split("T")[0])
      .lte("pickup_date", returnDate.toISOString().split("T")[0])
      .eq("status", "confirmed")

    if (reservationsError) {
      console.error("[v0] RESERVATIONS_ERROR:", reservationsError)
      return NextResponse.json(
        {
          error: "Error al verificar reservaciones",
          details: reservationsError.message,
          code: reservationsError.code,
        },
        { status: 500 },
      )
    }

    const reservedDressIds = new Set(reservations?.map((r) => r.dress_id) || [])
    const availableCount = allDresses.filter((d) => !reservedDressIds.has(d.id)).length

    return NextResponse.json({
      availableCount,
      message:
        availableCount > 0
          ? `Hay ${availableCount} vestido(s) disponible(s)`
          : "No hay vestidos disponibles para esta fecha",
    })
  } catch (error) {
    console.error("[v0] UNEXPECTED_ERROR:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 },
    )
  }
}
