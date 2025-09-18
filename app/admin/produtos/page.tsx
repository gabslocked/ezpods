"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AuthGuard } from "../components/auth-guard"

export default function AdminProdutosPage() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        // Aqui você pode fazer chamadas para APIs para obter os produtos
        // Por enquanto, vamos usar dados fictícios
        setProducts([])
        setIsLoading(false)
      } catch (err) {
        console.error("Erro ao carregar produtos:", err)
        setError("Erro ao carregar produtos")
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  return (
    <AuthGuard>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#2017C2]">Gerenciar Produtos</h1>
          <Link
            href="/admin/produtos/novo"
            className="px-4 py-2 bg-[#2017C2] text-white font-semibold rounded hover:bg-[#1A1450]"
          >
            Adicionar Produto
          </Link>
        </div>

        {error && <div className="bg-red-900 text-white p-4 mb-4 rounded">{error}</div>}

        {isLoading ? (
          <p>Carregando produtos...</p>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-900 rounded">
              <thead>
                <tr className="bg-gray-800">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-left">Preço</th>
                  <th className="p-3 text-left">Categoria</th>
                  <th className="p-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>{/* Renderizar produtos aqui */}</tbody>
            </table>
          </div>
        ) : (
          <p>Nenhum produto encontrado.</p>
        )}
      </div>
    </AuthGuard>
  )
}
