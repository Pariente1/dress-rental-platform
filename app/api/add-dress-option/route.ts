import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { type, name, hex_code } = await request.json()

    if (!type || !name || !["color", "size", "category"].includes(type)) {
      return NextResponse.json({ error: "Invalid type or missing name" }, { status: 400 })
    }

    const supabase = await createClient()
    const tableName = {
      color: "dress_colors",
      size: "dress_sizes",
      category: "dress_categories",
    }[type]

    const insertData = type === "color" ? { name, hex_code: hex_code || "#000000" } : { name, display_order: 999 }

    const { data, error } = await supabase.from(tableName).insert(insertData).select().single()

    if (error) {
      // Handle duplicate key error
      if (error.code === "23505") {
        return NextResponse.json({ error: `${type} "${name}" already exists` }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error("[v0] ADD_OPTION_ERROR:", error)
    return NextResponse.json(
      {
        error: "Error adding option",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
