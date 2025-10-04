"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Users,
  LogOut,
  Settings,
  Bell,
  Search
} from 'lucide-react'
import { Button } from './ui/button'

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
    { href: '/admin/products', label: 'Produtos', icon: Package },
    { href: '/admin/categories', label: 'Categorias', icon: FolderTree },
    { href: '/admin/users', label: 'Usuários', icon: Users },
  ]

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-gradient-to-b from-gray-900 via-gray-900 to-black border-r border-gray-800/50 shadow-2xl">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-20 border-b border-gray-800/50 bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <Link href="/admin/dashboard" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-2xl">EZ</span>
            </div>
          </div>
          <div>
            <span className="text-white font-bold text-xl block">EzPods</span>
            <span className="text-gray-400 text-xs">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
          Menu Principal
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 text-white border border-green-500/30 shadow-lg shadow-green-500/10'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white hover:border hover:border-gray-700/50'
              }`}
            >
              <div className={`p-2 rounded-lg transition-all ${
                isActive 
                  ? 'bg-gradient-to-br from-green-500 to-blue-600 shadow-lg' 
                  : 'bg-gray-800/50 group-hover:bg-gray-700/50'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="font-medium flex-1">{item.label}</span>
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section - BOTTOM */}
      <div className="border-t border-gray-800/50 bg-gradient-to-r from-gray-900 to-black">
        {user && (
          <div className="p-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-800/30 border border-gray-700/30 mb-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center flex-shrink-0 ring-2 ring-green-500/20">
                  <span className="text-white font-semibold text-lg">
                    {user.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate">
                  {user.name || 'Admin'}
                </div>
                <div className="text-gray-400 text-xs truncate">
                  {user.email}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-gray-700/50 flex-shrink-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sair da Conta
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
