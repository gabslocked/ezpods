const KYTE_API_URL = "https://kyte-query-api.kyte.site/api/product/2wLzfINjNcgLnP/groupByCategory"
const KYTE_IMAGE_BASE_URL = "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o"

interface KyteProduct {
  _id: string
  id: string
  name: string
  description: string
  code: string
  salePrice: number
  saleCostPrice: number
  image: string
  imageThumb: string
  imageLarge: string
  imageMedium: string
  category: {
    name: string
    id: string
  }
  active: boolean
  showOnCatalog: boolean
}

interface KyteCategory {
  name: string
  order: number
  totalProducts: number
  products: KyteProduct[]
}

interface Product {
  id: string
  nome: string
  descricao: string
  categoria: string
  preco: number
  imagem: string
  codigo: string
}

export async function fetchProductsFromKyte(): Promise<Product[]> {
  try {
    console.log("[v0] Fazendo requisição para API Kyte...")
    const response = await fetch(KYTE_API_URL, {
      method: "GET",
      headers: {
        accept: "*/*",
        "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6",
        "content-type": "application/json",
        "ocp-apim-subscription-key": "62dafa86be9543879a9b32d347c40ab9",
        origin: "https://exclusive01.kyte.site",
        referer: "https://exclusive01.kyte.site/",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      },
    })

    if (!response.ok) {
      console.log("[v0] Erro na resposta da API:", response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const categories: KyteCategory[] = await response.json()
    console.log("[v0] Dados recebidos da API:", categories)

    // Mapear os dados da API para a estrutura esperada pelo sistema
    const products: Product[] = []

    categories.forEach((category) => {
      console.log("[v0] Processando categoria:", category.name, "com", category.products?.length || 0, "produtos")

      if (category.products && Array.isArray(category.products)) {
        category.products.forEach((kyteProduct) => {
          console.log("[v0] Produto encontrado:", {
            name: kyteProduct.name,
            price: kyteProduct.salePrice,
            image: kyteProduct.imageThumb,
            active: kyteProduct.active,
            showOnCatalog: kyteProduct.showOnCatalog,
          })

          if (kyteProduct.active && kyteProduct.showOnCatalog) {
            let imageUrl = ""
            if (kyteProduct.imageThumb) {
              // Se a imagem já é uma URL completa, usar diretamente
              if (kyteProduct.imageThumb.startsWith("http")) {
                imageUrl = kyteProduct.imageThumb
              } else {
                // Concatenar diretamente a base URL com imageThumb (que já inclui ?alt=media)
                imageUrl = `${KYTE_IMAGE_BASE_URL}${kyteProduct.imageThumb}`
              }
            }

            const product: Product = {
              id: kyteProduct.id || kyteProduct._id,
              nome: kyteProduct.name || "Produto sem nome",
              descricao: kyteProduct.description || "",
              categoria: kyteProduct.category?.name || category.name,
              preco: kyteProduct.salePrice || 0,
              imagem: imageUrl,
              codigo: kyteProduct.code || "",
            }

            console.log("[v0] Produto mapeado:", product)
            products.push(product)
          }
        })
      }
    })

    console.log("[v0] Total de produtos processados:", products.length)
    return products
  } catch (error) {
    console.error("[v0] Erro ao buscar produtos da API Kyte:", error)
    // Retornar array vazio em caso de erro para não quebrar a aplicação
    return []
  }
}

export async function fetchCategoriesFromKyte(): Promise<string[]> {
  try {
    const response = await fetch(KYTE_API_URL, {
      method: "GET",
      headers: {
        accept: "*/*",
        "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6",
        "content-type": "application/json",
        "ocp-apim-subscription-key": "62dafa86be9543879a9b32d347c40ab9",
        origin: "https://exclusive01.kyte.site",
        referer: "https://exclusive01.kyte.site/",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      },
    })

    if (!response.ok) {
      console.log("[v0] Erro na resposta da API:", response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const categories: KyteCategory[] = await response.json()
    console.log("[v0] Dados recebidos da API:", categories)

    // Extrair nomes únicos das categorias e ordenar
    const categoryNames = categories
      .map((cat) => cat.name)
      .filter((name) => name && name.trim() !== "")
      .sort()

    return categoryNames
  } catch (error) {
    console.error("[v0] Erro ao buscar categorias da API Kyte:", error)
    // Retornar categorias padrão em caso de erro
    return ["IGNITE", "ELFBAR", "OXBAR", "DICKBAR", "LOST MARY", "VAPESOUL"]
  }
}
