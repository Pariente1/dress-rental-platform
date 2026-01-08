import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest) {
  try {
    console.log("[v0] Delete dress API called")
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] User authenticated:", !!user)

    const isDevelopment = process.env.NODE_ENV === "development"
    if (!user && !isDevelopment) {
      console.log("[v0] Unauthorized - no user and not in development")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[v0] Delete body:", body)
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "ID del vestido es requerido" }, { status: 400 })
    }

    const { error } = await supabase.from("dresses").delete().eq("id", id)

    if (error) {
      console.error("[v0] Supabase error deleting dress:", error)
      return NextResponse.json({ error: "Error al eliminar el vestido", details: error.message }, { status: 500 })
    }

    console.log("[v0] Dress deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in delete-dress API:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
