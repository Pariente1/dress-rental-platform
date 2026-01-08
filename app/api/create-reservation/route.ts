import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { dressId, customerName, customerEmail, customerPhone, eventDate, totalPrice } = await request.json()

    if (!dressId || !customerName || !customerEmail || !customerPhone || !eventDate || !totalPrice) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: existingReservations } = await supabase
      .from("reservations")
      .select("*")
      .eq("dress_id", dressId)
      .in("status", ["pending", "confirmed"])
      .lte("rental_start_date", eventDate)
      .gte("rental_end_date", eventDate)

    if (existingReservations && existingReservations.length > 0) {
      return NextResponse.json({ error: "El vestido ya no está disponible para esta fecha" }, { status: 409 })
    }

    const { data, error } = await supabase
      .from("reservations")
      .insert({
        dress_id: dressId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        rental_start_date: eventDate,
        rental_end_date: eventDate,
        total_price: totalPrice,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating reservation:", error)
      return NextResponse.json({ error: "Error al crear la reservación" }, { status: 500 })
    }

    return NextResponse.json({ success: true, reservation: data })
  } catch (error) {
    console.error("[v0] Error in create-reservation:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
