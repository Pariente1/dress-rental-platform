import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest) {
  try {
    const { type, name } = await request.json()

    if (!type || !name || !["color", "size", "category"].includes(type)) {
      return NextResponse.json({ error: "Invalid type or missing name" }, { status: 400 })
    }

    const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
    if (type === "size" && DEFAULT_SIZES.includes(name)) {
      return NextResponse.json({ error: `Cannot delete default size "${name}"` }, { status: 403 })
    }

    const supabase = await createClient()
    const tableName = {
      color: "dress_colors",
      size: "dress_sizes",
      category: "dress_categories",
    }[type]

    const { error } = await supabase.from(tableName).delete().eq("name", name)

    if (error) throw error

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[v0] DELETE_OPTION_ERROR:", error)
    return NextResponse.json(
      {
        error: "Error deleting option",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
