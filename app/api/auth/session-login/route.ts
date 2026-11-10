// app/api/auth/session-login/route.ts
import { NextResponse } from 'next/server';
import { upsertAppUser } from '@/lib/appUser'; // Sincronizador nativo BIOFLOW [passage 49]
import { setSessionCookie } from '@/lib/auth'; // Manipulador de cookies nativo BIOFLOW [passage 55]

export async function POST(req: Request) {
  try {
    const { id, email, nome } = await req.json();

    if (!id || !email) {
      return NextResponse.json({ error: 'Dados insuficientes para sincronizar sessão.' }, { status: 400 });
    }

    // 1. Sincroniza ou insere o usuário no banco de dados local via Prisma
    const dbUser = await upsertAppUser({
      id,
      nome,
      email,
    });

    // 2. Define o cookie de sessão criptografado 'bioflow_session' para o Middleware
    await setSessionCookie(dbUser.id);

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        nome: dbUser.nome,
        email: dbUser.email,
        role: dbUser.role || 'USER',
      }
    });

  } catch (error: any) {
    console.error('❌ [Session Login API] Erro crítico:', error);
    return NextResponse.json({ error: 'Erro interno ao sincronizar sessão.' }, { status: 500 });
  }
}