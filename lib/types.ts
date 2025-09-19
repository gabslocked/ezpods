export interface Product {
  id: string
  name: string
  description?: string
  position: number
  visible: boolean
  images: Array<{ image_url: string }>
  product_variants: Array<{
    id: string
    price: number
    original_price: number
    stock: number
  }>
  modifier_categories: Array<{
    id: string
    name: string
    min_modifiers: number
    max_modifiers: number
    required: boolean
    modifiers: Array<{
      id: string
      name: string
      price: number
      position: number
    }>
  }>
  // Legacy compatibility fields
  nome?: string
  descricao?: string
  categoria?: string
  preco?: number
  imagem?: string
  codigo?: string
  ativo?: boolean
  mostrarNoCatalogo?: boolean
  price?: string | number
  categories?: string
  sku?: string
  stock?: number
  originalPrice?: number
}

export interface ProductVariant {
  id: string
  cost: number
  price: number
  originalPrice: number
  stock: number
  name?: string
  sku?: string
  position: number
}

export interface ModifierCategory {
  id: string
  name: string
  minModifiers: number
  maxModifiers: number
  type: "one" | "many"
  required: boolean
  position: number
  modifiers: Modifier[]
}

export interface Modifier {
  id: string
  name: string
  cost: number
  price: number
  originalPrice: number
  position: number
  maxLimit: number
  visible: boolean
}

export interface Category {
  id: string
  name: string
  position: number
  products: Product[]
}

export interface OlaClickApiResponse {
  data: Category[]
}
