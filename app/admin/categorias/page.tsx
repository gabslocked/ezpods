"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AuthGuard } from "../components/auth-guard"

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategories() {
      try {
        // Aqui você pode fazer chamadas para APIs para obter as categorias
        // Por enquanto, vamos usar dados fictícios
        setCategories(["JUUL", "POD SYSTEM", "DESCARTÁVEL"])
        setIsLoading(false)
      } catch (err) {
        console.error("Erro ao carregar categorias:", err)
        setError("Erro ao carregar categorias")
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return

    try {
      // Adicionar categoria (implementação fictícia)
      setCategories([...categories, newCategory])
      setNewCategory("")
    } catch (err) {
      console.error("Erro ao adicionar categoria:", err)
      setError("Erro ao adicionar categoria")
    }
  }

  const handleDeleteCategory = async (category: string) => {
    try {
      // Excluir categoria (implementação fictícia)
      setCategories(categories.filter((c) => c !== category))
    } catch (err) {
      console.error("Erro ao excluir categoria:", err)
      setError("Erro ao excluir categoria")
    }
  }

  return (
    <AuthGuard>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-yellow-500">Gerenciar Categorias</h1>

        {error && <div className="bg-red-900 text-white p-4 mb-4 rounded">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">Adicionar Categoria</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label htmlFor="category" className="block mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  id="category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded hover:bg-yellow-600"
              >
                Adicionar
              </button>
            </form>
          </div>

          <div className="bg-gray-900 p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">Categorias Existentes</h2>
            {isLoading ? (
              <p>Carregando categorias...</p>
            ) : categories.length > 0 ? (
              <ul className="space-y-2">
                {categories.map((category, index) => (
                  <li key={index} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                    <span>{category}</span>
                    <button onClick={() => handleDeleteCategory(category)} className="text-red-500 hover:text-red-400">
                      Excluir
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhuma categoria encontrada.</p>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
