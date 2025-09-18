"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

export function AdminNavbar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      router.push("/admin/login")
      router.refresh()
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  return (
    <header className="bg-gray-900 border-b border-gray-800 mb-6">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          <Link href="/admin" className="text-xl font-bold text-[#2017C2]">
            MYPODS Admin
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              href="/admin"
              className={`text-sm ${pathname === "/admin" ? "text-[#2017C2]" : "text-gray-300 hover:text-white"}`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/produtos"
              className={`text-sm ${
                pathname.startsWith("/admin/produtos") ? "text-[#2017C2]" : "text-gray-300 hover:text-white"
              }`}
            >
              Produtos
            </Link>
            <Link
              href="/admin/categorias"
              className={`text-sm ${
                pathname.startsWith("/admin/categorias") ? "text-[#2017C2]" : "text-gray-300 hover:text-white"
              }`}
            >
              Categorias
            </Link>
            <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300">
              Sair
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
