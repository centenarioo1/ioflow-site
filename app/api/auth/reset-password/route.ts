import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/authHelper';

export async function POST(req: Request) {
  try {
    const { token, novaSenha } = await req.json().catch(() => ({}));

    if (!token || !novaSenha) {
      return NextResponse.json({ error: 'Token e nova senha são obrigatórios.' }, { status: 400 });
    }

    if (String(novaSenha).length < 6) {
      return NextResponse.json({ error: 'A senha deve conter no mínimo 6 caracteres.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: String(token),
        resetTokenExpiry: {
          gt: new Date(),
        },
      } as any,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'O link de redefinição é inválido ou expirou. Solicite um novo link.' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashPassword(novaSenha),
        resetToken: null,
        resetTokenExpiry: null,
      } as any,
    });

    return NextResponse.json({
      success: true,
      message: 'Sua senha foi redefinida com sucesso! Você já pode fazer login com a nova senha.',
    });

  } catch (error: any) {
    console.error('❌ Erro na rota reset-password:', error);
    return NextResponse.json({ error: 'Erro interno ao redefinir a senha.' }, { status: 500 });
  }
}