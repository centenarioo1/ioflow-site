import { NextResponse } from 'next/server';
import { getUsuarioLogado } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const authUser = await getUsuarioLogado();
    if (!authUser) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const cuponsUsados = await prisma.cupomUsado.findMany({
      where: { userId: authUser.id },
      include: {
        cupom: {
          select: {
            id: true,
            codigo: true,
            descricao: true,
            tipo: true,
            valor: true,
          },
        },
      },
      orderBy: { usadoEm: 'desc' },
    });

    return NextResponse.json({ cupons: cuponsUsados });
  } catch (error) {
    console.error('Erro ao buscar cupons usados:', error);
    return NextResponse.json({ error: 'Erro ao buscar cupons usados' }, { status: 500 });
  }
}
