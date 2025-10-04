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
  Settings,
  BarChart3,
  Bell,
  Home
} from 'lucide-react'

export function AdminMobileMenuNew() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag, badge: 5 },
    { href: '/admin/products', label: 'Produtos', icon: Package },
    { href: '/admin/categories', label: 'Categorias', icon: FolderTree },
    { href: '/admin/users', label: 'Usuários', icon: Users },
  ]

  const handleLogout = async () => {
    await logout()
    router.push('/')
    setIsOpen(false)
  }

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  // Get current page title
  const currentPage = navItems.find(item => isActive(item.href))?.label || 'Admin'

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-40">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-gray-800/50 text-white hover:bg-gray-800 transition-colors"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div>
            <h1 className="text-white font-semibold">{currentPage}</h1>
            <p className="text-gray-500 text-xs">EzPods Admin</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all">
            <Bell className="h-5 w-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bottom Sheet Menu */}
      <div
        className={`
          lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50
          transform transition-transform duration-300 ease-out rounded-t-3xl
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle Bar */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-gray-700 rounded-full"></div>
        </div>

        {/* User Info */}
        <div className="px-6 pb-4 border-b border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">{user?.name || 'Admin'}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-6 py-4 overflow-y-auto" style={{ maxHeight: '50vh' }}>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {navItems.slice(0, 3).map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-xl
                    transition-all duration-200 relative
                    ${active 
                      ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 text-green-400' 
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-6 w-6 mb-2" />
                  <span className="text-xs font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          <div className="space-y-2">
            {navItems.slice(3).map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${active 
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400' 
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Secondary Actions */}
          <div className="mt-6 pt-6 border-t border-gray-800/50 space-y-2">
            <Link
              href="/admin/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all"
            >
              <Settings className="h-5 w-5" />
              <span className="font-medium">Configurações</span>
            </Link>
            <Link
              href="/admin/analytics"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Analytics</span>
            </Link>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="px-6 py-4 border-t border-gray-800/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 text-red-400 rounded-xl transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sair da Conta</span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation Bar (Always Visible) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-gray-900 border-t border-gray-800 flex items-center justify-around z-30">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center p-2 relative
                ${active ? 'text-green-400' : 'text-gray-500'}
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
              {item.badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
        <button
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center justify-center p-2 text-gray-500"
        >
          <Menu className="h-5 w-5" />
          <span className="text-xs mt-1">Menu</span>
        </button>
      </div>
    </>
  )
}
