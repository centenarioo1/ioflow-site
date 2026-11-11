export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nome = body.nome?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.senha || body.password;

    if (!nome || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, e-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve conter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este e-mail já está cadastrado. Faça login para continuar.' },
        { status: 400 }
      );
    }

    const supabase = createAuthClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome },
      },
    });

    if (authError) {
      console.error('❌ Erro no Supabase Auth SignUp:', authError.message);
      return NextResponse.json(
        { error: authError.message || 'Erro ao criar conta no serviço de autenticação.' },
        { status: 400 }
      );
    }

    const sbUser = authData.user;
    const userId = sbUser?.id;

    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const role = adminEmail && email === adminEmail ? 'ADMIN' : 'USER';

    const dbUser = await prisma.user.create({
      data: {
        ...(userId ? { id: userId } : {}),
        nome,
        email,
        password: 'SUPABASE_AUTH_PROVIDER',
        role,
      },
    });

    return NextResponse.json({
      ok: true,
      message: 'Conta criada com sucesso!',
      user: {
        id: dbUser.id,
        nome: dbUser.nome,
        email: dbUser.email,
        role: dbUser.role,
      },
    });

  } catch (err: any) {
    console.error('❌ Erro ao criar conta:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno no servidor ao realizar cadastro.' },
      { status: 500 }
    );
  }
}