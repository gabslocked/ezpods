import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Proteger apenas rotas /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Ignorar middleware para rotas de API
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.next()
    }

    // Verificar cookie de autenticação
    const hasAuthCookie = request.cookies.has("admin_token")
    console.log(`=== MIDDLEWARE CHECK ===`)
    console.log(`Path: ${request.nextUrl.pathname}`)
    console.log(`Has admin_token: ${hasAuthCookie}`)
    console.log(`All cookies: ${request.cookies.toString()}`)
    console.log(`=== END MIDDLEWARE CHECK ===`)
    
    if (!hasAuthCookie) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
