import { NextResponse } from 'next/server';
import { getUsuarioLogado, toPublicUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const authUser = await getUsuarioLogado();
    if (!authUser) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const { nome } = await request.json();
    if (!nome || !String(nome).trim()) {
      return NextResponse.json({ error: 'Informe o nome.' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: authUser.id },
      data: { nome: String(nome).trim() },
    });

    return NextResponse.json({
      success: true,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
