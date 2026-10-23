// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('bioflow_session')?.value; // CORRIGIDO: mudou de 'session' para 'bioflow_session'

  console.log('🔒 Middleware verificando:', pathname);
  console.log('🔒 Token encontrado:', token ? 'SIM' : 'NÃO');

  // Protege rotas do Dashboard do Cliente e Painel Admin
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!token) {
      console.log('❌ Sem token, redirecionando para /login');
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url));
    }

    console.log('✅ Token válido, permitindo acesso');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/admin', '/admin/:path*'],
};