const OLACLICK_API_URL =
  "https://api2.olaclick.app/ms-products/public/companies/43da3645-d217-4757-9dd4-4633fe4ae976/categories"

import type { Product, OlaClickApiResponse, ProductVariant, ModifierCategory } from "./types"

export async function fetchProductsFromOlaClick(): Promise<Product[]> {
  try {
    console.log("[v0] Fazendo requisição para API OlaClick...")
    const response = await fetch(OLACLICK_API_URL, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6",
        origin: "https://ezpods.ola.click",
        referer: "https://ezpods.ola.click/",
        "sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      },
    })

    if (!response.ok) {
      console.log("[v0] Erro na resposta da API:", response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const apiResponse: OlaClickApiResponse = await response.json()
    console.log("[v0] Dados recebidos da API OlaClick:", apiResponse)

    // Mapear os dados da API para a estrutura esperada pelo sistema
    const products: Product[] = []

    apiResponse.data.forEach((category) => {
      console.log("[v0] Processando categoria:", category.name, "com", category.products?.length || 0, "produtos")

      if (category.products && Array.isArray(category.products)) {
        category.products.forEach((olaProduct) => {
          console.log("[v0] Produto encontrado:", {
            name: olaProduct.name,
            visible: olaProduct.visible,
            variants: olaProduct.product_variants?.length || 0,
          })

          // Só incluir produtos visíveis
          if (olaProduct.visible && olaProduct.product_variants && olaProduct.product_variants.length > 0) {
            // Usar o primeiro variant para preço e estoque
            const mainVariant = olaProduct.product_variants[0]

            // Processar imagens
            let imageUrl = ""
            if (olaProduct.images && olaProduct.images.length > 0) {
              imageUrl = olaProduct.images[0].image_url || ""
            }

            // Mapear variants
            const variants: ProductVariant[] = olaProduct.product_variants.map((variant) => ({
              id: variant.id,
              cost: (variant as any).cost || 0,
              price: variant.price,
              originalPrice: variant.original_price,
              stock: variant.stock,
              name: (variant as any).name || '',
              sku: (variant as any).sku || '',
              position: (variant as any).position || 0,
            }))

            // Mapear modifier categories
            const modifierCategories: ModifierCategory[] =
              olaProduct.modifier_categories?.map((modCat) => ({
                id: modCat.id,
                name: modCat.name,
                minModifiers: modCat.min_modifiers,
                maxModifiers: modCat.max_modifiers,
                type: (modCat as any).type as "one" | "many" || "one",
                required: modCat.required,
                position: (modCat as any).position || 0,
                modifiers: modCat.modifiers.map((mod) => ({
                  id: mod.id,
                  name: mod.name,
                  cost: (mod as any).cost || 0,
                  price: mod.price,
                  originalPrice: (mod as any).original_price || 0,
                  position: mod.position,
                  maxLimit: (mod as any).max_limit || 1,
                  visible: (mod as any).visible !== false,
                })),
              })) || []

            const product: Product = {
              id: olaProduct.id,
              nome: olaProduct.name || "Produto sem nome",
              descricao: olaProduct.description || "",
              categoria: category.name,
              preco: mainVariant.price || 0,
              imagem: imageUrl,
              codigo: (mainVariant as any).sku || "",
              ativo: true,
              mostrarNoCatalogo: olaProduct.visible,
              position: olaProduct.position,
              visible: olaProduct.visible,
              stock: mainVariant.stock,
              originalPrice: mainVariant.original_price,
              // variants,
              // modifierCategories,
              // Compatibility fields
              name: olaProduct.name,
              price: mainVariant.price,
              categories: category.name,
              images: [{ image_url: imageUrl }],
              sku: (mainVariant as any).sku || '',
              product_variants: olaProduct.product_variants,
              modifier_categories: olaProduct.modifier_categories || [],
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
    console.error("[v0] Erro ao buscar produtos da API OlaClick:", error)
    // Retornar array vazio em caso de erro para não quebrar a aplicação
    return []
  }
}

export async function fetchCategoriesFromOlaClick(): Promise<string[]> {
  try {
    const response = await fetch(OLACLICK_API_URL, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6",
        origin: "https://ezpods.ola.click",
        referer: "https://ezpods.ola.click/",
        "sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      },
    })

    if (!response.ok) {
      console.log("[v0] Erro na resposta da API:", response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const apiResponse: OlaClickApiResponse = await response.json()
    console.log("[v0] Dados recebidos da API OlaClick:", apiResponse)

    // Extrair nomes únicos das categorias e ordenar por posição
    const categoryNames = apiResponse.data
      .sort((a, b) => a.position - b.position)
      .map((cat) => cat.name)
      .filter((name) => name && name.trim() !== "")

    return categoryNames
  } catch (error) {
    console.error("[v0] Erro ao buscar categorias da API OlaClick:", error)
    // Retornar categorias padrão em caso de erro
    return ["MAIS VENDIDOS", "IGNITE", "OXBAR", "LOST MARY", "ELFBAR", "Recarregáveis", "Headshop"]
  }
}
