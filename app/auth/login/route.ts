// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/authHelper';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'bioflow-dev-secret-change-in-prod-123456';
const SESSION_COOKIE = 'bioflow_session'; // Nome oficial do cookie esperado pelo seu Middleware

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    // 1. Busca o usuário no banco
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    // 2. Valida a senha criptografada
    const senhaValida = verifyPassword(password, user.password);
    if (!senhaValida) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    // 3. Gera o Token criptografado oficial do seu sistema (Padrão de auth.ts)
    const payload = Buffer.from(user.id).toString('base64url');
    const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
    const tokenSessao = `${payload}.${sig}`;

    // 4. Define o cookie seguro com o nome oficial esperado pelo middleware.ts
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, tokenSessao, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias de persistência
      path: '/',
    });

    // 5. Retorna os dados para sincronização no LocalStorage do Frontend
    return NextResponse.json({
      success: true,
      ok: true,
      user: {
        id: user.id,
        nome: user.nome,
        name: user.nome, // suporte para legado
        email: user.email,
        role: user.role || 'USER',
      }
    });

  } catch (error) {
    console.error('❌ Erro na autenticação de login:', error);
    return NextResponse.json({ error: 'Erro interno ao realizar login.' }, { status: 500 });
  }
}