import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { dressId, eventDate } = await request.json()

    if (!dressId || !eventDate) {
      return NextResponse.json(
        {
          error: "Faltan parámetros requeridos",
          details: `dressId: ${dressId ? "OK" : "MISSING"}, eventDate: ${eventDate ? "OK" : "MISSING"}`,
        },
        { status: 400 },
      )
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
        available: false,
        message: "No se pueden consultar vestidos de fechas anteriores al día de hoy",
      })
    }

    if (selectedDate > maxDate) {
      const currentYear = today.getFullYear()
      return NextResponse.json({
        available: false,
        message: `No se pueden consultar vestidos de ${currentYear + 2} o posteriores`,
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
          details: clientError instanceof Error ? clientError.message : "Unknown client error",
        },
        { status: 500 },
      )
    }

    // Verificar que el vestido existe y está disponible
    const { data: dress, error: dressError } = await supabase.from("dresses").select("*").eq("id", dressId).single()

    if (dressError) {
      console.error("[v0] DRESS_FETCH_ERROR:", dressError)
      return NextResponse.json(
        {
          error: "Error al buscar vestido",
          details: dressError.message,
          code: dressError.code,
        },
        { status: 500 },
      )
    }

    if (!dress) {
      return NextResponse.json({ error: "Vestido no encontrado" }, { status: 404 })
    }

    if (!dress.available) {
      return NextResponse.json({ available: false, message: "Este vestido no está disponible actualmente" })
    }

    const pickupDate = new Date(selectedDate)
    pickupDate.setDate(pickupDate.getDate() - 2)
    const returnDate = new Date(selectedDate)
    returnDate.setDate(returnDate.getDate() + 1)

    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select("*")
      .eq("dress_id", dressId)
      .in("status", ["pending", "confirmed"])

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

    // Check for overlapping reservations
    const hasConflict = reservations?.some((res) => {
      const resStart = new Date(res.rental_start_date || res.pickup_date)
      const resEnd = new Date(res.rental_end_date || res.return_date)
      return pickupDate <= resEnd && returnDate >= resStart
    })

    const isAvailable = !hasConflict

    return NextResponse.json({
      available: isAvailable,
      message: isAvailable
        ? "¡El vestido está disponible para tu evento!"
        : "El vestido no está disponible en esta fecha. Por favor elige otra fecha.",
    })
  } catch (error) {
    console.error("[v0] UNEXPECTED_ERROR:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
