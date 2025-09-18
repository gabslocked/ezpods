import type { Product } from "./types"
import { fetchProductsFromOlaClick, fetchCategoriesFromOlaClick } from "./olaclick-api"

export async function getProducts(
  category?: string,
  searchQuery?: string,
  page = 1,
  limit = 30,
): Promise<{ products: Product[]; total: number }> {
  try {
    const records = await fetchProductsFromOlaClick()

    let filteredProducts = records

    // Filter by category if provided
    if (category) {
      const normalizedCategory = category.toLowerCase()
      filteredProducts = filteredProducts.filter((product) => {
        if (!product.categoria) return false
        return product.categoria.toLowerCase() === normalizedCategory
      })
    }

    // Filter by search query if provided
    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase()
      filteredProducts = filteredProducts.filter(
        (product) =>
          (product.nome && product.nome.toLowerCase().includes(normalizedQuery)) ||
          (product.categoria && product.categoria.toLowerCase().includes(normalizedQuery)) ||
          (product.descricao && product.descricao.toLowerCase().includes(normalizedQuery)),
      )
    }

    // Calculate total before pagination
    const total = filteredProducts.length

    // Apply pagination
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedProducts = filteredProducts.slice(start, end)

    return { products: paginatedProducts, total }
  } catch (error) {
    console.error("Error reading products:", error)
    console.error("Error details:", error instanceof Error ? error.message : String(error))
    return { products: [], total: 0 }
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    return await fetchCategoriesFromOlaClick()
  } catch (error) {
    console.error("Error getting categories:", error)
    return []
  }
}
