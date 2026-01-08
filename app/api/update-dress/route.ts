import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // In development, allow updates without auth for testing
    const isDevelopment = process.env.NODE_ENV === "development"
    if (!user && !isDevelopment) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description, price_per_day, size, category, color, image_url } = body

    if (!id) {
      return NextResponse.json({ error: "ID del vestido es requerido" }, { status: 400 })
    }

    const { data: dress, error } = await supabase
      .from("dresses")
      .update({
        name,
        description,
        price_per_day,
        size,
        category,
        color,
        image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error updating dress:", error)
      return NextResponse.json(
        { error: "Error al actualizar el vestido", details: error.message, code: error.code },
        { status: 500 },
      )
    }

    return NextResponse.json({ dress })
  } catch (error) {
    console.error("[v0] Error in update-dress API:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
