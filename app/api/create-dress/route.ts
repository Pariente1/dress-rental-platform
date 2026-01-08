import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] create-dress API called")

    const body = await request.json()
    console.log("[v0] Request body:", JSON.stringify(body, null, 2))

    const { name, description, size, price_per_day, category, image_url, color } = body

    if (!name) {
      console.error("[v0] Missing field: name")
      return NextResponse.json({ error: "Falta el nombre del vestido" }, { status: 400 })
    }
    if (!size) {
      console.error("[v0] Missing field: size")
      return NextResponse.json({ error: "Falta la talla del vestido" }, { status: 400 })
    }
    if (!price_per_day) {
      console.error("[v0] Missing field: price_per_day")
      return NextResponse.json({ error: "Falta el precio del vestido" }, { status: 400 })
    }
    if (!category) {
      console.error("[v0] Missing field: category")
      return NextResponse.json({ error: "Falta la categoría del vestido" }, { status: 400 })
    }
    if (!image_url) {
      console.error("[v0] Missing field: image_url")
      return NextResponse.json({ error: "Falta la imagen del vestido" }, { status: 400 })
    }
    if (!color) {
      console.error("[v0] Missing field: color")
      return NextResponse.json({ error: "Falta el color del vestido" }, { status: 400 })
    }

    console.log("[v0] All fields validated, creating Supabase client...")

    let supabase
    try {
      supabase = await createClient()
      console.log("[v0] Supabase client created successfully")
    } catch (clientError) {
      console.error("[v0] Error creating Supabase client:", clientError)
      return NextResponse.json(
        {
          error: "Error de conexión con la base de datos",
          details: clientError instanceof Error ? clientError.message : "Unknown client error",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Inserting dress into database...")

    const { data, error } = await supabase
      .from("dresses")
      .insert({
        name,
        description: description || null,
        size,
        price_per_day: Number(price_per_day),
        category,
        image_url,
        color,
        available: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase insert error:", JSON.stringify(error, null, 2))
      return NextResponse.json(
        {
          error: "Error al crear el vestido en la base de datos",
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Dress created successfully:", data)
    return NextResponse.json({ success: true, dress: data })
  } catch (error) {
    console.error("[v0] Unexpected error in create-dress:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack available")
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
