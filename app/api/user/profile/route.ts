import { NextResponse } from 'next/server';
import { getUserIdFromCookies } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const userId = await getUserIdFromCookies();
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { nome, email } = await req.json();

    if (!nome?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Nome e e-mail são obrigatórios.' }, { status: 400 });
    }

    const emailFormatado = email.trim().toLowerCase();

    // Impede e-mails duplicados em outras contas
    const duplicado = await prisma.user.findFirst({
      where: {
        email: emailFormatado,
        NOT: { id: userId }
      }
    });

    if (duplicado) {
      return NextResponse.json({ error: 'Este endereço de e-mail já está em uso.' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { nome: nome.trim(), email: emailFormatado }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar dados.' }, { status: 500 });
  }
}