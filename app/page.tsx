import { Suspense } from "react"
import ProductCatalog from "@/components/product-catalog"
import SearchBar from "@/components/search-bar"
import { getProducts } from "@/lib/products"
import LoadingProducts from "@/components/loading-products"
import ErrorFallback from "@/components/error-fallback"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="bg-gradient-to-r from-black via-gray-900 to-black py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
            Bem-vindo ao EzPods
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Descubra nossa coleção exclusiva de pods premium
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar />
        </div>

        <Suspense fallback={<LoadingProducts />}>
          <InitialProducts />
        </Suspense>
      </div>
    </div>
  )
}

// Separate async component for initial data fetching
async function InitialProducts() {
  try {
    const { products } = await getProducts(undefined, undefined, 1, 30)

    if (!products || products.length === 0) {
      return <ErrorFallback />
    }

    return <ProductCatalog products={products} groupByCategory={true} />
  } catch (error) {
    console.error("Erro ao carregar a página inicial:", error)
    return <ErrorFallback />
  }
}
