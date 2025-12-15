import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Se o usuário estiver logado e tentar acessar páginas de auth
    if (req.nextauth.token && req.nextUrl.pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acesso a páginas de auth mesmo sem token
        if (req.nextUrl.pathname.startsWith("/auth")) {
          return true
        }
        // Para outras rotas (dashboard, etc), exigir token
        return !!token
      }
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/consultations/:path*", 
    "/admin/:path*",
    "/auth/:path*"
  ]
}
