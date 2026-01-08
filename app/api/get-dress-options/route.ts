import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const [colorsRes, sizesRes, categoriesRes] = await Promise.all([
      supabase.from("dress_colors").select("id, name, hex_code, display_name").order("name"),
      supabase.from("dress_sizes").select("id, name, display_order").order("display_order"),
      supabase.from("dress_categories").select("id, name, display_name").order("name"),
    ])

    if (colorsRes.error) throw colorsRes.error
    if (sizesRes.error) throw sizesRes.error
    if (categoriesRes.error) throw categoriesRes.error

    return NextResponse.json({
      colors: colorsRes.data || [],
      sizes: sizesRes.data || [],
      categories: categoriesRes.data || [],
    })
  } catch (error) {
    console.error("[v0] GET_OPTIONS_ERROR:", error)
    return NextResponse.json(
      {
        error: "Error fetching options",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
