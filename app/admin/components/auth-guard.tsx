"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminNavbar } from "./admin-navbar"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Não verificar autenticação na página de login
    if (pathname === "/admin/login") {
      setIsLoading(false)
      return
    }

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/check")

        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          router.push("/admin/login")
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        router.push("/admin/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (pathname !== "/admin/login" && !isAuthenticated) {
    return null
  }

  return (
    <>
      {isAuthenticated && pathname !== "/admin/login" && <AdminNavbar />}
      {children}
    </>
  )
}
