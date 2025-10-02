"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Search, Edit, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
  description: string
  visible: boolean
  created_at: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: "", description: "" })
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check admin authentication via API
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/check')
        if (!response.ok) {
          router.push('/login')
          return
        }
        
        const data = await response.json()
        if (!data.authenticated) {
          router.push('/login')
          return
        }

        // Load categories if authenticated
        loadCategories()
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    // Filter categories based on search term
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories)
    } else {
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCategories(filtered)
    }
  }, [categories, searchTerm])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
        setError(null)
      } else {
        setError("Erro ao carregar categorias")
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
      setError("Erro ao carregar categorias")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      setError("Nome da categoria é obrigatório")
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description,
        }),
      })

      if (response.ok) {
        setNewCategory({ name: "", description: "" })
        setShowCreateForm(false)
        await loadCategories() // Reload categories
      } else {
        const data = await response.json()
        setError(data.error || "Erro ao criar categoria")
      }
    } catch (error) {
      console.error("Erro ao criar categoria:", error)
      setError("Erro ao criar categoria")
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando categorias...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Gerenciar Categorias</h1>
              <p className="text-gray-400">Visualize e gerencie todas as categorias do sistema</p>
            </div>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Create Category Form */}
        {showCreateForm && (
          <div className="mb-6 p-6 bg-gray-800 border border-gray-600 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Nova Categoria</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowCreateForm(false)
                  setNewCategory({ name: "", description: "" })
                  setError(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome da Categoria *
                </label>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Digite o nome da categoria"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <Textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Digite uma descrição para a categoria (opcional)"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleCreateCategory}
                  disabled={isCreating || !newCategory.name.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isCreating ? "Criando..." : "Criar Categoria"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewCategory({ name: "", description: "" })
                    setError(null)
                  }}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{category.name}</CardTitle>
                  <Badge variant={category.visible ? "default" : "secondary"}>
                    {category.visible ? "Visível" : "Oculta"}
                  </Badge>
                </div>
                <CardDescription className="text-gray-400">
                  {category.description || "Sem descrição"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Criada em: {new Date(category.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-red-600 text-red-400 hover:bg-red-900/50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {searchTerm ? "Nenhuma categoria encontrada" : "Nenhuma categoria cadastrada"}
            </div>
            {!searchTerm && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira categoria
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
