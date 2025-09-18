export interface Product {
  id: string
  nome: string
  descricao?: string
  categoria: string
  preco: number
  imagem: string
  codigo: string
  ativo?: boolean
  mostrarNoCatalogo?: boolean
  // Campos de compatibilidade para componentes existentes
  name?: string
  price?: string | number
  categories?: string
  images?: string
  sku?: string
  // New fields for OlaClick API
  position?: number
  visible?: boolean
  stock?: number
  originalPrice?: number
  variants?: ProductVariant[]
  modifierCategories?: ModifierCategory[]
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
