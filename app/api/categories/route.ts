import { NextResponse } from "next/server"
import { getCategories } from "@/lib/products"

export async function GET() {
  try {
    const categories = await getCategories()

    const response = NextResponse.json({ categories })
    response.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200")

    return response
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ categories: [], error: "Failed to fetch categories" }, { status: 500 })
  }
}
