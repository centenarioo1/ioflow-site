// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/authHelper';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Suporta tanto o envio em português quanto em inglês
    const nomeInput = body.nome || body.name;
    const emailInput = body.email;
    const senhaInput = body.senha || body.password;

    // 1. Validação básica de campos obrigatórios
    if (!nomeInput?.trim() || !emailInput?.trim() || !senhaInput?.trim()) {
      return NextResponse.json({ error: 'Nome, E-mail e Senha são obrigatórios.' }, { status: 400 });
    }

    const emailFormatado = emailInput.trim().toLowerCase();

    // 2. Bloqueio de e-mail duplicado (Validação profissional)
    const usuarioExistente = await prisma.user.findUnique({
      where: { email: emailFormatado },
    });

    if (usuarioExistente) {
      return NextResponse.json({ error: 'Este endereço de e-mail já está sendo utilizado.' }, { status: 400 });
    }

    // 3. Criação segura do usuário gravando apenas os campos reais da tabela User
    const novoUsuario = await prisma.user.create({
      data: {
        nome: nomeInput.trim(),
        email: emailFormatado,
        password: hashPassword(senhaInput),
        role: 'USER', // Todas as contas nascem como USER
      },
    });

    return NextResponse.json({
      success: true,
      ok: true, // Mantém compatibilidade com verificações legadas
      message: 'Usuário cadastrado com sucesso!',
      user: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        role: novoUsuario.role,
      }
    });

  } catch (error: any) {
    console.error('❌ Erro no cadastro de usuário:', error);
    return NextResponse.json({ error: 'Erro interno no servidor ao processar o cadastro.' }, { status: 500 });
  }
}