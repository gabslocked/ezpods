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
  ChevronRight,
  Settings,
  BarChart3,
  Bell,
  HelpCircle
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: number
}

export function AdminSidebarNew() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const mainNavItems: NavItem[] = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag, badge: 5 },
    { href: '/admin/products', label: 'Produtos', icon: Package },
    { href: '/admin/categories', label: 'Categorias', icon: FolderTree },
    { href: '/admin/users', label: 'Usuários', icon: Users },
  ]

  const secondaryNavItems: NavItem[] = [
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Configurações', icon: Settings },
  ]

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-r border-gray-800">
      {/* Logo Section - Fixed Height */}
      <div className="flex items-center justify-center h-20 border-b border-gray-800/50">
        <Link href="/admin/dashboard" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">EZ</span>
            </div>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">EzPods</h1>
            <p className="text-gray-500 text-xs">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation - Flex Grow */}
      <nav className="flex-1 overflow-y-auto py-6 px-4">
        {/* Main Nav Items */}
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Principal
          </h3>
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-lg
                  transition-all duration-200 group relative
                  ${active 
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 shadow-lg' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${active ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-r-full -ml-4"></div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Secondary Nav Items */}
        <div className="mt-8 space-y-1">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Ferramentas
          </h3>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-lg
                  transition-all duration-200 group
                  ${active 
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${active ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
          <h4 className="text-white font-semibold text-sm mb-2">Ações Rápidas</h4>
          <div className="space-y-2">
            <button className="w-full text-left text-gray-400 hover:text-white text-sm flex items-center space-x-2 py-1">
              <Bell className="h-4 w-4" />
              <span>Notificações</span>
            </button>
            <button className="w-full text-left text-gray-400 hover:text-white text-sm flex items-center space-x-2 py-1">
              <HelpCircle className="h-4 w-4" />
              <span>Suporte</span>
            </button>
          </div>
        </div>
      </nav>

      {/* User Section - Fixed at Bottom */}
      <div className="border-t border-gray-800/50 p-4">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/30 mb-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">
              {user?.name || 'Admin'}
            </p>
            <p className="text-gray-500 text-xs truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 text-red-400 rounded-lg transition-all duration-200 group"
        >
          <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  )
}
