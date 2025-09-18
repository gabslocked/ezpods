"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AuthGuard } from "./components/auth-guard"

export default function AdminDashboardPage() {
  const [productCount, setProductCount] = useState(0)
  const [categoryCount, setCategoryCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        // Aqui você pode fazer chamadas para APIs para obter os dados
        // Por enquanto, vamos usar dados fictícios
        setProductCount(150)
        setCategoryCount(10)
        setIsLoading(false)
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err)
        setError("Erro ao carregar dados do dashboard")
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <AuthGuard>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-[#2017C2]">Dashboard</h1>

        {error && <div className="bg-red-900 text-white p-4 mb-4 rounded">{error}</div>}

        {isLoading ? (
          <p>Carregando dados...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded shadow-lg">
              <h2 className="text-xl font-semibold mb-2">Produtos</h2>
              <p className="text-4xl font-bold text-[#2017C2] mb-4">{productCount}</p>
              <Link
                href="/admin/produtos"
                className="inline-block px-4 py-2 bg-[#2017C2] text-white font-semibold rounded hover:bg-[#1A1450]"
              >
                Gerenciar Produtos
              </Link>
            </div>

            <div className="bg-gray-900 p-6 rounded shadow-lg">
              <h2 className="text-xl font-semibold mb-2">Categorias</h2>
              <p className="text-4xl font-bold text-[#2017C2] mb-4">{categoryCount}</p>
              <Link
                href="/admin/categorias"
                className="inline-block px-4 py-2 bg-[#2017C2] text-white font-semibold rounded hover:bg-[#1A1450]"
              >
                Gerenciar Categorias
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
