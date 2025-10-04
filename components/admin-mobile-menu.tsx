"use client"

import React, { useState } from 'react'
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
  Menu,
  X,
  Settings
} from 'lucide-react'
import { Button } from './ui/button'

export function AdminMobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
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
    setIsOpen(false)
  }

  return (
    <div className="lg:hidden">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-gray-900 via-gray-900 to-black border-b border-gray-800/50 flex items-center justify-between px-4 z-50 shadow-xl">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">EZ</span>
          </div>
          <div>
            <span className="text-white font-bold text-lg">EzPods</span>
            <span className="text-gray-400 text-xs block -mt-1">Admin</span>
          </div>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:bg-gray-800/50"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 mt-16"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide Menu */}
      <div
        className={`fixed top-16 right-0 bottom-0 w-80 bg-gradient-to-b from-gray-900 via-gray-900 to-black border-l border-gray-800/50 z-40 transform transition-transform duration-300 ease-out shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-gray-800/50">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-800/30 border border-gray-700/30">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center flex-shrink-0 ring-2 ring-green-500/20">
                    <span className="text-white font-semibold text-lg">
                      {user.name?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">
                    {user.name || 'Admin'}
                  </div>
                  <div className="text-gray-400 text-sm truncate">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 text-white border border-green-500/30 shadow-lg'
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

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-800/50 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800/50 border border-gray-700/30"
            >
              <Settings className="h-5 w-5 mr-3" />
              Configurações
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sair da Conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
