"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Package, BarChart3, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0
  })
  const [isLoading, setIsLoading] = useState(true)
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

        // Load dashboard stats if authenticated
        loadStats()
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        console.error("Erro ao carregar estatísticas:", response.status)
        // Fallback to zeros if API fails
        setStats({
          totalUsers: 0,
          totalProducts: 0,
          totalCategories: 0,
          totalOrders: 0
        })
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
      // Fallback to zeros if API fails
      setStats({
        totalUsers: 0,
        totalProducts: 0,
        totalCategories: 0,
        totalOrders: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-md py-6 border-b border-gray-600/30 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                EzPods Admin
              </h1>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-white hover:text-gray-300 transition-all duration-300 hover:bg-gray-800/50"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total de Usuários</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-full">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total de Produtos</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalProducts}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-full">
                <Package className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Categorias</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalCategories}</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-full">
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total de Pedidos</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalOrders}</p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-full">
                <Settings className="h-8 w-8 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/users">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-500/20 p-4 rounded-full group-hover:bg-blue-500/30 transition-all duration-300">
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Gerenciar Usuários</h3>
                  <p className="text-gray-400 mt-1">Visualizar e gerenciar usuários cadastrados</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/products">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="bg-green-500/20 p-4 rounded-full group-hover:bg-green-500/30 transition-all duration-300">
                  <Package className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Gerenciar Produtos</h3>
                  <p className="text-gray-400 mt-1">Adicionar, editar e remover produtos</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/categories">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-500/20 p-4 rounded-full group-hover:bg-purple-500/30 transition-all duration-300">
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Gerenciar Categorias</h3>
                  <p className="text-gray-400 mt-1">Organizar categorias de produtos</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
