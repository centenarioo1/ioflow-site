// app/api/auth/session-login/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { cookies } from 'next/headers';

const SECRET = process.env.AUTH_SECRET || 'bioflow-dev-secret-change-in-prod-123456';
const SESSION_COOKIE = 'bioflow_session';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, email, nome } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório para sincronizar a sessão.' },
        { status: 400 }
      );
    }

    const emailClean = email.trim().toLowerCase();

    // 1. Busca usuário existente pelo ID do Supabase ou pelo E-mail no Prisma
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(id ? [{ id: String(id) }] : []),
          { email: emailClean },
        ],
      },
    });

    // 2. Cria se não existir
    if (!dbUser) {
      const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
      const role = adminEmail && emailClean === adminEmail ? 'ADMIN' : 'USER';

      dbUser = await prisma.user.create({
        data: {
          id: id || undefined,
          nome: nome || 'Cultivador',
          email: emailClean,
          password: 'SUPABASE_AUTH_PROVIDER',
          role,
        },
      });
    } else {
      // 🟢 PRESERVA dbUser.id para não violar chaves estrangeiras com pedidos/tópicos
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { nome: nome || dbUser.nome },
      });
    }

    // 3. Gera token de sessão assinado
    const payload = Buffer.from(dbUser.id).toString('base64url');
    const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
    const tokenSessao = `${payload}.${sig}`;

    // 4. Grava o cookie seguro no Next.js 15
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, tokenSessao, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: '/',
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: dbUser.id,
        nome: dbUser.nome,
        email: dbUser.email,
        role: dbUser.role,
      },
    });

  } catch (err: any) {
    console.error('❌ [API session-login] Erro interno:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao sincronizar sessão.' },
      { status: 500 }
    );
  }
}