import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Proteger apenas rotas /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Ignorar middleware para página de login e rotas de API
    if (request.nextUrl.pathname === "/admin/login" || request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.next()
    }

    // Verificar cookie de autenticação
    const hasAuthCookie = request.cookies.has("admin_token")
    if (!hasAuthCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
